package za.co.hercode.imali.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import za.co.hercode.imali.domain.LoanCostCalculator.LoanCost;
import za.co.hercode.imali.domain.LoanCostCalculator.LoanQuote;
import za.co.hercode.imali.domain.OfferAnalyser.Analysis;
import za.co.hercode.imali.domain.OfferAnalyser.Risk;
import za.co.hercode.imali.domain.RunwayForecaster.Confidence;
import za.co.hercode.imali.domain.RunwayForecaster.Forecast;
import za.co.hercode.imali.domain.RunwayForecaster.Income;

/** Plain unit tests for the core engines. No Spring, no database. */
class DomainLogicTest {

    private static BigDecimal bd(String s) {
        return new BigDecimal(s);
    }

    private final LocalDate today = LocalDate.of(2026, 10, 18);

    // ---------- income split

    private final IncomeSplitter splitter = new IncomeSplitter();

    @Test
    void billsComeFirstThenSavingsThenSpending() {
        var s = splitter.split(bd("2800"), bd("900"));
        assertEquals(bd("900.00"), s.bills());
        assertEquals(bd("190.00"), s.savings());
        assertEquals(bd("1710.00"), s.spendNow());
        assertEquals(bd("2800.00"), s.spendNow().add(s.bills()).add(s.savings()));
    }

    @Test
    void billsAreCappedAtHalfOfAPayment() {
        var s = splitter.split(bd("400"), bd("900"));
        assertEquals(bd("200.00"), s.bills());
        assertEquals(bd("20.00"), s.savings());
        assertEquals(bd("180.00"), s.spendNow());
    }

    @Test
    void smallRemainderIsNotSaved() {
        var s = splitter.split(bd("80"), bd("0"));
        assertEquals(bd("0.00"), s.savings());
        assertEquals(bd("80.00"), s.spendNow());
    }

    @Test
    void rejectsZeroAmount() {
        assertThrows(IllegalArgumentException.class, () -> splitter.split(bd("0"), bd("0")));
    }

    // ---------- loan cost

    @Test
    void loanCostIsExplainedInPercentages() {
        LoanCost c = new LoanCostCalculator().calculate(new LoanQuote(bd("1000"), bd("1500"), 30));
        assertEquals(bd("500.00"), c.totalCost());
        assertEquals(bd("50.0"), c.costPercent());
        assertEquals(bd("50.0"), c.costPercentPerMonth());
        assertEquals(bd("608.3"), c.annualisedPercent());
    }

    // ---------- forecast

    private final RunwayForecaster forecaster = new RunwayForecaster();

    private List<Income> weeklyThousand() {
        return List.of(
                new Income(today.minusDays(24), bd("1000")), new Income(today.minusDays(17), bd("1000")),
                new Income(today.minusDays(10), bd("1000")), new Income(today.minusDays(3), bd("1000")));
    }

    @Test
    void steadyIncomeThatOutpacesSpendingGivesNoWarning() {
        Forecast f = forecaster.forecast(bd("500"), bd("100"), weeklyThousand(), today);
        assertEquals(5, f.daysCovered());
        assertEquals(LocalDate.of(2026, 10, 22), f.expectedNextIncome());
        assertNull(f.projectedShortfall());
        assertEquals(Confidence.HIGH, f.confidence());
    }

    @Test
    void spendingAheadOfIncomeWarnsBeforeItHappens() {
        Forecast f = forecaster.forecast(bd("500"), bd("200"), weeklyThousand(), today);
        assertEquals(LocalDate.of(2026, 10, 21), f.projectedShortfall());
        assertEquals(3, f.daysUntilShortfall());
    }

    @Test
    void withoutHistoryOnlyTheRunwayIsKnown() {
        Forecast f = forecaster.forecast(bd("500"), bd("100"), List.of(), today);
        assertEquals(Confidence.LOW, f.confidence());
        assertEquals(LocalDate.of(2026, 10, 24), f.projectedShortfall());
    }

    @Test
    void erraticPaymentAmountsLowerTheConfidence() {
        Forecast f = forecaster.forecast(bd("900"), bd("420"), DemoHistory.generate(today), today);
        assertEquals(Confidence.MEDIUM, f.confidence());
        assertTrue(f.projectedShortfall() != null, "the demo account should show a shortfall warning");
    }

    // ---------- offers and scams

    private final OfferAnalyser analyser =
            new OfferAnalyser(new ScamScanner(), new LoanCostCalculator(), new RuleBasedOfferExplainer());

    private static List<String> codes(Analysis a) {
        return a.flags().stream().map(ScamScanner.Flag::code).sorted().toList();
    }

    @Test
    void advanceFeeScamSmsIsHighRisk() {
        Analysis a = analyser.analyse("URGENT! Your loan of R5000 is approved. Pay a R350 processing fee first to release "
                + "the funds. Send your PIN to confirm. bit.ly/xyz", null);
        assertEquals(Risk.HIGH, a.risk());
        assertEquals(List.of("ADVANCE_FEE", "ASKS_FOR_SECRET", "NO_NCR_NUMBER", "SHORT_LINK", "URGENCY"), codes(a));
    }

    @Test
    void aBanksNeverShareWarningIsNotTreatedAsAScam() {
        Analysis a = analyser.analyse("Standard Bank: Your OTP is 123456. Never share your OTP or PIN with anyone.", null);
        assertEquals(Risk.NONE, a.risk());
        assertTrue(a.flags().isEmpty());
    }

    @Test
    void loanSharkTermsAreFlagged() {
        Analysis a = analyser.analyse("Quick cash loan. We hold your SASSA card until you repay. NCR reg NCRCP1234.",
                new LoanQuote(bd("1000"), bd("1500"), 30));
        assertEquals(Risk.HIGH, a.risk());
        assertEquals(List.of("COLLATERAL_CARD", "VERY_HIGH_COST"), codes(a));
    }

    @Test
    void aReasonablyPricedRegisteredOfferHasNoFlags() {
        Analysis a = analyser.analyse("Personal loan offer. NCRCP9999. Borrow R2000, repay R2300 over 60 days.",
                new LoanQuote(bd("2000"), bd("2300"), 60));
        assertEquals(Risk.NONE, a.risk());
    }
}
