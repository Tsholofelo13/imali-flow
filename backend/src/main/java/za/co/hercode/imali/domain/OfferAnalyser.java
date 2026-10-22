package za.co.hercode.imali.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import za.co.hercode.imali.domain.LoanCostCalculator.LoanCost;
import za.co.hercode.imali.domain.LoanCostCalculator.LoanQuote;
import za.co.hercode.imali.domain.ScamScanner.Flag;
import za.co.hercode.imali.domain.ScamScanner.Severity;

/** Snap and Explain, backend side: text and (optionally) the loan numbers in, findings and explanation out. */
public class OfferAnalyser {

    public enum Risk { NONE, LOW, MEDIUM, HIGH }

    public record Analysis(Risk risk, List<Flag> flags, LoanQuote quote, LoanCost cost, String explanation) {
    }

    // Cost thresholds, as % of the amount borrowed per 30 days. Tune with your mentors / the NCR guidance.
    private static final BigDecimal HIGH_COST_PER_MONTH = new BigDecimal("30");
    private static final BigDecimal ELEVATED_COST_PER_MONTH = new BigDecimal("15");

    private final ScamScanner scanner;
    private final LoanCostCalculator calculator;
    private final OfferExplainer explainer;

    public OfferAnalyser(ScamScanner scanner, LoanCostCalculator calculator, OfferExplainer explainer) {
        this.scanner = scanner;
        this.calculator = calculator;
        this.explainer = explainer;
    }

    /** @param quote the loan numbers, or null when only the message text is available */
    public Analysis analyse(String text, LoanQuote quote) {
        List<Flag> flags = new ArrayList<>(scanner.scan(text));

        LoanCost cost = null;
        if (quote != null) {
            cost = calculator.calculate(quote);
            if (cost.costPercentPerMonth().compareTo(HIGH_COST_PER_MONTH) >= 0) {
                flags.add(new Flag(Severity.HIGH, "VERY_HIGH_COST",
                        "This loan costs " + cost.costPercentPerMonth().toPlainString()
                                + "% of the amount borrowed every 30 days. That is extremely expensive."));
            } else if (cost.costPercentPerMonth().compareTo(ELEVATED_COST_PER_MONTH) >= 0) {
                flags.add(new Flag(Severity.MEDIUM, "HIGH_COST",
                        "This loan costs " + cost.costPercentPerMonth().toPlainString()
                                + "% of the amount borrowed every 30 days. Compare with other lenders."));
            }
        }

        Risk risk = riskOf(flags);
        return new Analysis(risk, flags, quote, cost, explainer.explain(risk, flags, quote, cost));
    }

    static Risk riskOf(List<Flag> flags) {
        int score = 0;
        for (Flag f : flags) {
            score += switch (f.severity()) {
                case HIGH -> 3;
                case MEDIUM -> 2;
                case LOW -> 1;
            };
        }
        if (score >= 3) return Risk.HIGH;
        if (score == 2) return Risk.MEDIUM;
        if (score == 1) return Risk.LOW;
        return Risk.NONE;
    }
}
