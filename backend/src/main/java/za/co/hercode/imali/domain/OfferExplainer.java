package za.co.hercode.imali.domain;

import java.util.List;

import za.co.hercode.imali.domain.LoanCostCalculator.LoanCost;
import za.co.hercode.imali.domain.LoanCostCalculator.LoanQuote;
import za.co.hercode.imali.domain.OfferAnalyser.Risk;
import za.co.hercode.imali.domain.ScamScanner.Flag;

/**
 * Turns findings into plain language.
 *
 * The default implementation is rule-based (RuleBasedOfferExplainer). To add the AI explainer, write another
 * implementation that calls your language model with the findings, and register it as the OfferExplainer bean
 * in AppConfig. Keep the numbers coming from LoanCostCalculator so the AI explains them but never invents them.
 */
public interface OfferExplainer {

    String explain(Risk risk, List<Flag> flags, LoanQuote quote, LoanCost cost);
}
