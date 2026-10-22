package za.co.hercode.imali.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import za.co.hercode.imali.domain.IncomeSplitter;
import za.co.hercode.imali.domain.LoanCostCalculator;
import za.co.hercode.imali.domain.OfferAnalyser;
import za.co.hercode.imali.domain.OfferExplainer;
import za.co.hercode.imali.domain.RuleBasedOfferExplainer;
import za.co.hercode.imali.domain.RunwayForecaster;
import za.co.hercode.imali.domain.ScamScanner;

/** Wires the plain-Java domain engines in as Spring beans. */
@Configuration
public class AppConfig {

    /** All "today" decisions use South African time, so "today" is right for users late at night. */
    @Bean
    Clock clock() {
        return Clock.system(ZoneId.of("Africa/Johannesburg"));
    }

    @Bean
    IncomeSplitter incomeSplitter() {
        return new IncomeSplitter();
    }

    @Bean
    RunwayForecaster runwayForecaster() {
        return new RunwayForecaster();
    }

    @Bean
    LoanCostCalculator loanCostCalculator() {
        return new LoanCostCalculator();
    }

    @Bean
    ScamScanner scamScanner() {
        return new ScamScanner();
    }

    /** Swap this for an AI-backed implementation to add the language-model explainer. */
    @Bean
    OfferExplainer offerExplainer() {
        return new RuleBasedOfferExplainer();
    }

    @Bean
    OfferAnalyser offerAnalyser(ScamScanner scanner, LoanCostCalculator calculator, OfferExplainer explainer) {
        return new OfferAnalyser(scanner, calculator, explainer);
    }
}
