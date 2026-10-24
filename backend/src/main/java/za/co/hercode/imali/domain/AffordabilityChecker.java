package za.co.hercode.imali.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import za.co.hercode.imali.domain.LoanCostCalculator.LoanQuote;
import za.co.hercode.imali.domain.RunwayForecaster.Income;

/**
 * "Can I afford this?" Looks at the loan against the user's own numbers and says whether they can pay it back
 * without running short.
 *
 * How it works (kept simple on purpose, so it can be explained in one breath):
 *  - Money needed until the due date = daily spending + the bills share for those days + the full repayment.
 *  - Money available = the balance now + the income we expect, based on how much the user was paid in the last 90 days.
 *  - The loan money itself is NOT counted as available, because it is usually spent on the thing it was borrowed for.
 *  - Left over below zero = RISKY (a debt trap is likely). Under 20% of the repayment = TIGHT. Otherwise OK.
 */
public class AffordabilityChecker {

    public enum Verdict { OK, TIGHT, RISKY }

    public record Result(Verdict verdict,
                         BigDecimal moneyAvailable,
                         BigDecimal moneyNeeded,
                         BigDecimal expectedIncome,
                         BigDecimal leftOver,
                         String message) {
    }

    private static final int HISTORY_DAYS = 90;
    private static final int MIN_DAYS_FOR_AVERAGE = 30;
    private static final BigDecimal TIGHT_BUFFER = new BigDecimal("0.20");

    public Result check(BigDecimal balance, BigDecimal dailySpend, BigDecimal monthlyObligations,
                        List<Income> history, LocalDate today, LoanQuote quote) {
        if (quote == null || quote.totalRepayable() == null || quote.termDays() < 1) {
            throw new IllegalArgumentException("Loan numbers are required");
        }
        BigDecimal bal = orZero(balance);
        BigDecimal daily = orZero(dailySpend);
        BigDecimal bills = orZero(monthlyObligations);
        BigDecimal term = BigDecimal.valueOf(quote.termDays());

        BigDecimal living = daily.multiply(term);
        BigDecimal billsShare = bills.multiply(term).divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
        BigDecimal needed = living.add(billsShare).add(quote.totalRepayable()).setScale(2, RoundingMode.HALF_UP);

        BigDecimal expectedIncome = averageDailyIncome(history, today).multiply(term).setScale(2, RoundingMode.HALF_UP);
        BigDecimal available = bal.add(expectedIncome).setScale(2, RoundingMode.HALF_UP);
        BigDecimal leftOver = available.subtract(needed).setScale(2, RoundingMode.HALF_UP);

        Verdict verdict;
        String message;
        if (leftOver.signum() < 0) {
            verdict = Verdict.RISKY;
            message = "On your numbers you could run short before this loan is paid back. "
                    + "That is how a debt trap starts: a new loan to pay the old one.";
        } else if (leftOver.compareTo(quote.totalRepayable().multiply(TIGHT_BUFFER)) < 0) {
            verdict = Verdict.TIGHT;
            message = "You could pay this back, but it would leave you with very little. "
                    + "Think about borrowing less, or ask for more time to repay.";
        } else {
            verdict = Verdict.OK;
            message = "On your numbers you can pay this back and still cover your usual spending.";
        }
        return new Result(verdict, available, needed, expectedIncome, leftOver, message);
    }

    /** Total paid in the last 90 days, spread over those days (at least 30, so one payment is not overstated). */
    static BigDecimal averageDailyIncome(List<Income> history, LocalDate today) {
        if (history == null || history.isEmpty()) {
            return BigDecimal.ZERO;
        }
        LocalDate from = today.minusDays(HISTORY_DAYS - 1L);
        BigDecimal sum = BigDecimal.ZERO;
        LocalDate earliest = null;
        for (Income income : history) {
            if (income.date().isBefore(from) || income.date().isAfter(today)) {
                continue;
            }
            sum = sum.add(income.amount());
            if (earliest == null || income.date().isBefore(earliest)) {
                earliest = income.date();
            }
        }
        if (earliest == null) {
            return BigDecimal.ZERO;
        }
        long span = ChronoUnit.DAYS.between(earliest, today) + 1;
        long days = Math.max(MIN_DAYS_FOR_AVERAGE, span);
        return sum.divide(BigDecimal.valueOf(days), 6, RoundingMode.HALF_UP);
    }

    private static BigDecimal orZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}