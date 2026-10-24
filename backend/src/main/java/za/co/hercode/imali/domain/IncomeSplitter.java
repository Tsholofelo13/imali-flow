package za.co.hercode.imali.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Splits a payment into "spend now", "bills" and "savings".
 *
 * Rules (simple on purpose, so users can understand them):
 *  - Bills come first: set aside what is still owed for the month, but never more than half of this payment.
 *  - From what is left, save 10% (skipped when the remainder is under R100, so tiny payments stay usable).
 *  - Everything else is spend-now money.
 */
public class IncomeSplitter {

    private static final BigDecimal MAX_BILLS_SHARE = new BigDecimal("0.50");
    private static final BigDecimal SAVINGS_RATE = new BigDecimal("0.10");
    private static final BigDecimal MIN_FOR_SAVINGS = new BigDecimal("100");

    public record Split(BigDecimal spendNow, BigDecimal bills, BigDecimal savings) {
    }

    /**
     * @param amount          payment just received (must be positive)
     * @param billsStillOwed  bills the user still has to set aside this month (negative values are treated as zero)
     */
    public Split split(BigDecimal amount, BigDecimal billsStillOwed) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        BigDecimal owed = billsStillOwed == null ? BigDecimal.ZERO : billsStillOwed.max(BigDecimal.ZERO);

        BigDecimal bills = owed.min(amount.multiply(MAX_BILLS_SHARE)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal afterBills = amount.subtract(bills);
        BigDecimal savings = afterBills.compareTo(MIN_FOR_SAVINGS) < 0
                ? BigDecimal.ZERO.setScale(2)
                : afterBills.multiply(SAVINGS_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal spendNow = amount.subtract(bills).subtract(savings).setScale(2, RoundingMode.HALF_UP);

        return new Split(spendNow, bills, savings);
    }
}
