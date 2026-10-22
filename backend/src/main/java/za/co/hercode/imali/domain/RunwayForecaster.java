package za.co.hercode.imali.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * Learns a user's income rhythm (how often money arrives and how much) and projects their spendable balance
 * forward to warn about shortfalls.
 *
 * Two numbers are produced:
 *  - daysCovered: how long the current balance lasts if NO more income arrives ("runway").
 *  - projectedShortfall: the first day the balance goes negative if income keeps arriving the way it usually does.
 *
 * Deliberately transparent (typical gap between payments + median payment size) rather than a black box:
 * it is easy to explain to users and to judges, and it needs no training data.
 */
public class RunwayForecaster {

    public static final int HORIZON_DAYS = 60;
    private static final int MAX_DAYS_COVERED = 3650;
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("d MMM", Locale.ENGLISH);

    public enum Confidence { LOW, MEDIUM, HIGH }

    public record Income(LocalDate date, BigDecimal amount) {
    }

    public record Forecast(int daysCovered,
                           LocalDate coveredUntil,
                           LocalDate expectedNextIncome,
                           BigDecimal expectedNextAmount,
                           LocalDate projectedShortfall,
                           Integer daysUntilShortfall,
                           Confidence confidence,
                           String message) {
    }

    public Forecast forecast(BigDecimal balance, BigDecimal dailySpend, List<Income> history, LocalDate today) {
        if (dailySpend == null || dailySpend.signum() <= 0) {
            throw new IllegalArgumentException("Daily spend must be greater than zero");
        }
        BigDecimal bal = balance == null ? BigDecimal.ZERO : balance.max(BigDecimal.ZERO);

        BigDecimal wholeDays = bal.divide(dailySpend, 0, RoundingMode.FLOOR);
        int daysCovered = wholeDays.compareTo(BigDecimal.valueOf(MAX_DAYS_COVERED)) > 0
                ? MAX_DAYS_COVERED
                : wholeDays.intValue();
        LocalDate coveredUntil = today.plusDays(daysCovered);

        // Merge same-day payments, ignore future-dated or invalid ones.
        TreeMap<LocalDate, BigDecimal> byDay = new TreeMap<>();
        if (history != null) {
            for (Income i : history) {
                if (i == null || i.date() == null || i.amount() == null || i.amount().signum() <= 0) continue;
                if (i.date().isAfter(today)) continue;
                byDay.merge(i.date(), i.amount(), BigDecimal::add);
            }
        }

        // Not enough history to see a pattern: only the no-income runway is meaningful.
        if (byDay.size() < 2) {
            LocalDate shortfall = daysCovered < HORIZON_DAYS ? today.plusDays(daysCovered + 1L) : null;
            String msg = shortfall == null
                    ? "Your money covers you for at least " + HORIZON_DAYS + " days at this pace."
                    : "Your money lasts about " + daysCovered + " days at this pace. Log a few more payments so we can learn your pattern.";
            return new Forecast(daysCovered, coveredUntil, null, null, shortfall,
                    shortfall == null ? null : (int) ChronoUnit.DAYS.between(today, shortfall),
                    Confidence.LOW, msg);
        }

        List<LocalDate> dates = new ArrayList<>(byDay.keySet());
        List<Long> gaps = new ArrayList<>();
        for (int i = 1; i < dates.size(); i++) {
            gaps.add(ChronoUnit.DAYS.between(dates.get(i - 1), dates.get(i)));
        }
        double meanGap = gaps.stream().mapToLong(Long::longValue).average().orElse(7);
        int gapDays = (int) Math.max(1, Math.round(meanGap));
        double gapCv = coefficientOfVariation(gaps.stream().map(Long::doubleValue).toList());
        double amountCv = coefficientOfVariation(byDay.values().stream().map(BigDecimal::doubleValue).toList());
        // Confidence is limited by whichever is less predictable: WHEN money arrives, or HOW MUCH.
        double cv = Math.max(gapCv, amountCv);

        Confidence confidence;
        if (dates.size() < 4) confidence = Confidence.LOW;
        else if (cv < 0.35) confidence = Confidence.HIGH;
        else if (cv < 0.70) confidence = Confidence.MEDIUM;
        else confidence = Confidence.LOW;

        BigDecimal typical = median(new ArrayList<>(byDay.values()));

        LocalDate next = dates.get(dates.size() - 1).plusDays(gapDays);
        if (!next.isAfter(today)) {
            next = today.plusDays(1); // payment is overdue: assume it lands soon
        }
        Set<LocalDate> expectedPayDays = new HashSet<>();
        for (LocalDate d = next; !d.isAfter(today.plusDays(HORIZON_DAYS)); d = d.plusDays(gapDays)) {
            expectedPayDays.add(d);
        }

        LocalDate shortfall = null;
        BigDecimal running = bal;
        for (int i = 1; i <= HORIZON_DAYS; i++) {
            LocalDate day = today.plusDays(i);
            running = running.subtract(dailySpend);
            if (expectedPayDays.contains(day)) {
                running = running.add(typical);
            }
            if (running.signum() < 0) {
                shortfall = day;
                break;
            }
        }

        Integer daysUntil = shortfall == null ? null : (int) ChronoUnit.DAYS.between(today, shortfall);
        String message = shortfall == null
                ? "You look covered for the next " + HORIZON_DAYS + " days if your income keeps arriving as usual."
                : "Heads up: you may run short around " + DAY.format(shortfall) + " (in " + daysUntil
                  + " days), even if your usual income arrives.";

        return new Forecast(daysCovered, coveredUntil, next, typical, shortfall, daysUntil, confidence, message);
    }

    /** Standard deviation divided by the mean: 0 means perfectly steady, higher means more erratic. */
    private static double coefficientOfVariation(List<Double> values) {
        double mean = values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        if (mean <= 0) return 1;
        double variance = values.stream().mapToDouble(v -> (v - mean) * (v - mean)).average().orElse(0);
        return Math.sqrt(variance) / mean;
    }

    private static BigDecimal median(List<BigDecimal> values) {
        Collections.sort(values);
        int n = values.size();
        if (n % 2 == 1) return values.get(n / 2).setScale(2, RoundingMode.HALF_UP);
        return values.get(n / 2 - 1).add(values.get(n / 2)).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
    }
}
