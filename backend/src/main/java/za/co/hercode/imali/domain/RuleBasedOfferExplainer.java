package za.co.hercode.imali.domain;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

import za.co.hercode.imali.domain.LoanCostCalculator.LoanCost;
import za.co.hercode.imali.domain.LoanCostCalculator.LoanQuote;
import za.co.hercode.imali.domain.OfferAnalyser.Risk;
import za.co.hercode.imali.domain.ScamScanner.Flag;

/** Plain-English explanation built from the findings. No AI, no network, always available. */
public class RuleBasedOfferExplainer implements OfferExplainer {

    @Override
    public String explain(Risk risk, List<Flag> flags, LoanQuote quote, LoanCost cost) {
        StringBuilder sb = new StringBuilder();

        if (quote != null && cost != null) {
            sb.append("If you borrow ").append(rand(quote.principal()))
              .append(" you will pay back ").append(rand(quote.totalRepayable()))
              .append(" within ").append(quote.termDays()).append(quote.termDays() == 1 ? " day. " : " days. ")
              .append("That is ").append(rand(cost.totalCost())).append(" extra, or ")
              .append(cost.costPercent().toPlainString()).append("% of what you borrowed")
              .append(" (about ").append(cost.annualisedPercent().toPlainString()).append("% a year). ");
        }

        switch (risk) {
            case HIGH -> sb.append("This looks dangerous. Do not pay anything or share any details. ");
            case MEDIUM -> sb.append("Be careful. There are warning signs here. ");
            case LOW -> sb.append("A few small warning signs. Check before you continue. ");
            case NONE -> sb.append("We found no obvious red flags, but that does not prove it is safe. ");
        }

        if (!flags.isEmpty()) {
            sb.append("What we noticed: ");
            for (Flag f : flags) {
                sb.append(f.message()).append(' ');
            }
        }

        if (risk != Risk.NONE) {
            sb.append("Before you decide, check that the lender is registered at ncr.org.za, and talk to someone you trust.");
        } else {
            sb.append("Always check that the lender is registered at ncr.org.za before you sign.");
        }
        return sb.toString().trim();
    }

    private static String rand(BigDecimal amount) {
        return String.format(Locale.ENGLISH, "R%,.2f", amount);
    }
}
