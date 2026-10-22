package za.co.hercode.imali.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import za.co.hercode.imali.domain.RunwayForecaster.Income;

/** Synthetic income history for the judges' demo account. No real personal data. */
public final class DemoHistory {

    private DemoHistory() {
    }

    /** About 10 weeks of irregular payments (R300 to R1,790, every 2 to 6 days), the last one before {@code today}. */
    public static List<Income> generate(LocalDate today) {
        Random random = new Random(42); // fixed seed: the demo is the same every time
        List<Income> out = new ArrayList<>();
        LocalDate day = today.minusDays(70);
        while (day.isBefore(today)) {
            int amount = (300 + random.nextInt(1500)) / 10 * 10;
            out.add(new Income(day, BigDecimal.valueOf(amount).setScale(2)));
            day = day.plusDays(2 + random.nextInt(5));
        }
        return out;
    }
}
