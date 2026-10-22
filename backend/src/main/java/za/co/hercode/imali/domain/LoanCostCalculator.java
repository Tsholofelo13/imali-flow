package za.co.hercode.imali.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Turns "borrow R1,000, repay R1,500 in 30 days" into numbers a person can compare. */
public class LoanCostCalculator {

    public record LoanQuote(BigDecimal principal, BigDecimal totalRepayable, int termDays) {
    }

    /**
     * @param totalCost            rands paid on top of what was borrowed (interest + all fees)
     * @param costPercent          totalCost as % of the amount borrowed
     * @param costPercentPerMonth  the same cost scaled to a 30-day month
     * @param annualisedPercent    simple (non-compounded) yearly equivalent
     */
    public record LoanCost(BigDecimal totalCost,
                           BigDecimal costPercent,
                           BigDecimal costPercentPerMonth,
                           BigDecimal annualisedPercent) {
    }

    public LoanCost calculate(LoanQuote q) {
        if (q == null || q.principal() == null || q.totalRepayable() == null) {
            throw new IllegalArgumentException("Loan amount and total repayable are required");
        }
        if (q.principal().signum() <= 0) {
            throw new IllegalArgumentException("Loan amount must be greater than zero");
        }
        if (q.totalRepayable().compareTo(q.principal()) < 0) {
            throw new IllegalArgumentException("Total repayable cannot be less than the amount borrowed");
        }
        if (q.termDays() < 1 || q.termDays() > 3650) {
            throw new IllegalArgumentException("Term must be between 1 and 3650 days");
        }

        BigDecimal cost = q.totalRepayable().subtract(q.principal()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal fraction = cost.divide(q.principal(), 6, RoundingMode.HALF_UP);
        BigDecimal pct = fraction.multiply(BigDecimal.valueOf(100));
        BigDecimal days = BigDecimal.valueOf(q.termDays());

        return new LoanCost(
                cost,
                pct.setScale(1, RoundingMode.HALF_UP),
                pct.multiply(BigDecimal.valueOf(30)).divide(days, 1, RoundingMode.HALF_UP),
                pct.multiply(BigDecimal.valueOf(365)).divide(days, 1, RoundingMode.HALF_UP));
    }
}
