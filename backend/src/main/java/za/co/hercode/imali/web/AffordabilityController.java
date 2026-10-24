package za.co.hercode.imali.web;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import za.co.hercode.imali.domain.AffordabilityChecker;
import za.co.hercode.imali.domain.AffordabilityChecker.Result;
import za.co.hercode.imali.domain.AffordabilityChecker.Verdict;
import za.co.hercode.imali.domain.LoanCostCalculator;
import za.co.hercode.imali.domain.LoanCostCalculator.LoanCost;
import za.co.hercode.imali.domain.LoanCostCalculator.LoanQuote;
import za.co.hercode.imali.domain.RunwayForecaster.Income;
import za.co.hercode.imali.model.UserAccount;
import za.co.hercode.imali.repo.UserRepository;
import za.co.hercode.imali.service.IncomeService;

/** "Can I afford this?": a loan checked against the signed-in user's own numbers. Nothing is stored. */
@RestController
@RequestMapping("/api/affordability")
public class AffordabilityController {

    public record AffordabilityRequest(
            @NotNull @DecimalMin("0.01") BigDecimal principal,
            @NotNull @DecimalMin("0.01") BigDecimal totalRepayable,
            @NotNull @Min(1) @Max(3650) Integer termDays) {
    }

    public record AffordabilityResponse(Verdict verdict,
                                        BigDecimal repayAmount,
                                        BigDecimal costPercentPerMonth,
                                        BigDecimal moneyAvailable,
                                        BigDecimal moneyNeeded,
                                        BigDecimal expectedIncome,
                                        BigDecimal leftOver,
                                        String message,
                                        List<String> tips) {
    }

    private final UserRepository users;
    private final IncomeService incomes;
    private final LoanCostCalculator calculator;
    private final Clock clock;
    private final AffordabilityChecker checker = new AffordabilityChecker();

    public AffordabilityController(UserRepository users, IncomeService incomes, LoanCostCalculator calculator, Clock clock) {
        this.users = users;
        this.incomes = incomes;
        this.calculator = calculator;
        this.clock = clock;
    }

    @PostMapping
    public AffordabilityResponse check(Authentication auth, @Valid @RequestBody AffordabilityRequest request) {
        UserAccount user = users.findById(CurrentUser.id(auth))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        LoanQuote quote = new LoanQuote(request.principal(), request.totalRepayable(), request.termDays());
        LoanCost cost = calculator.calculate(quote); // also rejects a repayment smaller than the loan

        List<Income> history = incomes.latest(user.getId(), 200).stream()
                .map(e -> new Income(e.getReceivedOn(), e.getAmount()))
                .toList();

        Result result = checker.check(user.getCurrentBalance(), user.getDailySpend(), user.getMonthlyObligations(),
                history, LocalDate.now(clock), quote);

        List<String> tips = new ArrayList<>();
        if (user.getDailySpend() == null || user.getDailySpend().signum() <= 0) {
            tips.add("Add your bills and daily spending in your profile for a more accurate answer.");
        }
        if (history.isEmpty()) {
            tips.add("You have not logged any payments yet, so this assumes you will earn nothing else.");
        }
        if (result.verdict() == Verdict.RISKY) {
            tips.add("Borrowing again to pay this loan back is how debt traps grow. Ask the lender for a smaller amount "
                    + "or a longer term, or speak to a registered debt counsellor.");
        }
        tips.add("Only borrow from a lender registered with the National Credit Regulator (NCR). You can check at ncr.org.za.");
        tips.add("Ask for the total you will pay back in writing before you agree.");
        tips.add("Never hand over your ID, bank card or PIN to get a loan.");

        return new AffordabilityResponse(result.verdict(), request.totalRepayable(), cost.costPercentPerMonth(),
                result.moneyAvailable(), result.moneyNeeded(), result.expectedIncome(), result.leftOver(),
                result.message(), tips);
    }
}