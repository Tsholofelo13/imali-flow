package za.co.hercode.imali.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import za.co.hercode.imali.domain.IncomeSplitter;
import za.co.hercode.imali.domain.IncomeSplitter.Split;
import za.co.hercode.imali.model.IncomeEvent;
import za.co.hercode.imali.model.UserAccount;
import za.co.hercode.imali.repo.IncomeRepository;
import za.co.hercode.imali.repo.UserRepository;

@Service
public class IncomeService {

    public record Recorded(UUID id, LocalDate receivedOn, BigDecimal amount,
                           BigDecimal spendNow, BigDecimal bills, BigDecimal savings,
                           BigDecimal newBalance) {
    }

    private final UserRepository users;
    private final IncomeRepository incomes;
    private final IncomeSplitter splitter;
    private final Clock clock;

    public IncomeService(UserRepository users, IncomeRepository incomes, IncomeSplitter splitter, Clock clock) {
        this.users = users;
        this.incomes = incomes;
        this.splitter = splitter;
        this.clock = clock;
    }

    /** Saves a payment, works out the split, and adds the spend-now share to the user's balance. */
    @Transactional
    public Recorded record(UUID userId, BigDecimal amount, LocalDate receivedOn, String source) {
        UserAccount user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        LocalDate today = LocalDate.now(clock);
        LocalDate date = receivedOn == null ? today : receivedOn;
        if (date.isAfter(today)) {
            throw new IllegalArgumentException("A payment cannot be dated in the future");
        }

        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP);
        BigDecimal alreadySetAside = billsSetAsideInMonth(userId, YearMonth.from(date));
        BigDecimal stillOwed = user.getMonthlyObligations().subtract(alreadySetAside);

        Split split = splitter.split(scaled, stillOwed);

        IncomeEvent event = new IncomeEvent();
        event.setUserId(userId);
        event.setAmount(scaled);
        event.setReceivedOn(date);
        event.setSource(source);
        event.setSpendNow(split.spendNow());
        event.setBills(split.bills());
        event.setSavings(split.savings());
        incomes.save(event);

        user.setCurrentBalance(user.getCurrentBalance().add(split.spendNow()));
        users.save(user);

        return new Recorded(event.getId(), date, scaled, split.spendNow(), split.bills(), split.savings(),
                user.getCurrentBalance());
    }

    @Transactional(readOnly = true)
    public List<IncomeEvent> latest(UUID userId, int limit) {
        return incomes.findByUserIdOrderByReceivedOnDesc(userId).stream().limit(limit).toList();
    }

    private BigDecimal billsSetAsideInMonth(UUID userId, YearMonth month) {
        return incomes.findByUserIdOrderByReceivedOnAsc(userId).stream()
                .filter(e -> YearMonth.from(e.getReceivedOn()).equals(month))
                .map(IncomeEvent::getBills)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
