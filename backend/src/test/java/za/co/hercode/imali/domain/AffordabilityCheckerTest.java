package za.co.hercode.imali.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import za.co.hercode.imali.domain.AffordabilityChecker.Result;
import za.co.hercode.imali.domain.AffordabilityChecker.Verdict;
import za.co.hercode.imali.domain.LoanCostCalculator.LoanQuote;
import za.co.hercode.imali.domain.RunwayForecaster.Income;

class AffordabilityCheckerTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 24);
    // Borrow R1,000, pay back R1,150 in 30 days.
    private static final LoanQuote QUOTE = new LoanQuote(new BigDecimal("1000"), new BigDecimal("1150"), 30);
    private final AffordabilityChecker checker = new AffordabilityChecker();

    private Result run(String balance, List<Income> history) {
        // R100 a day and R1,500 a month in bills: R3,000 + R1,500 + R1,150 repayment = R5,650 needed.
        return checker.check(new BigDecimal(balance), new BigDecimal("100"), new BigDecimal("1500"), history, TODAY, QUOTE);
    }

    @Test
    void plentyOfMoneyIsOk() {
        Result r = run("8000", List.of());
        assertEquals(Verdict.OK, r.verdict());
        assertEquals(new BigDecimal("5650.00"), r.moneyNeeded());
        assertEquals(new BigDecimal("2350.00"), r.leftOver());
    }

    @Test
    void notEnoughMoneyIsRisky() {
        Result r = run("5000", List.of());
        assertEquals(Verdict.RISKY, r.verdict());
        assertEquals(new BigDecimal("-650.00"), r.leftOver());
    }

    @Test
    void justEnoughIsTight() {
        assertEquals(Verdict.TIGHT, run("5700", List.of()).verdict());
    }

    @Test
    void recentIncomeCanMakeItOk() {
        List<Income> history = List.of(
                new Income(TODAY.minusDays(29), new BigDecimal("1500")),
                new Income(TODAY.minusDays(15), new BigDecimal("1500")),
                new Income(TODAY.minusDays(2), new BigDecimal("1500")));
        Result r = run("5000", history);
        assertEquals(new BigDecimal("4500.00"), r.expectedIncome());
        assertEquals(Verdict.OK, r.verdict());
    }

    @Test
    void oldIncomeIsIgnored() {
        List<Income> history = List.of(new Income(TODAY.minusDays(200), new BigDecimal("9000")));
        assertEquals(new BigDecimal("0.00"), run("5000", history).expectedIncome());
    }
}