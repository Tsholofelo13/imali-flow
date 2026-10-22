package za.co.hercode.imali.demo;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import za.co.hercode.imali.domain.DemoHistory;
import za.co.hercode.imali.domain.RunwayForecaster.Income;
import za.co.hercode.imali.model.UserAccount;
import za.co.hercode.imali.repo.UserRepository;
import za.co.hercode.imali.service.IncomeService;

/**
 * Creates the judges' demo account with synthetic data only (no real personal information).
 * Off by default. Turn on with imali.demo.enabled=true (the dev profile does).
 * The history ends yesterday, and the balance and daily spend are set so the forecast shows a shortfall warning.
 */
@Component
@ConditionalOnProperty(name = "imali.demo.enabled", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final IncomeService incomeService;
    private final PasswordEncoder encoder;
    private final Clock clock;
    private final String email;
    private final String password;

    public DemoDataSeeder(UserRepository users, IncomeService incomeService, PasswordEncoder encoder, Clock clock,
                          @Value("${imali.demo.email:demo@imali.app}") String email,
                          @Value("${imali.demo.password}") String password) {
        this.users = users;
        this.incomeService = incomeService;
        this.encoder = encoder;
        this.clock = clock;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (users.existsByEmailIgnoreCase(email)) {
            return;
        }
        LocalDate today = LocalDate.now(clock);

        UserAccount demo = new UserAccount();
        demo.setEmail(email);
        demo.setPasswordHash(encoder.encode(password));
        demo.setDisplayName("Thandi (demo)");
        demo.setLanguage("en");
        demo.setMonthlyObligations(new BigDecimal("1800.00"));
        demo.setDailySpend(new BigDecimal("420.00"));
        demo = users.save(demo);

        for (Income income : DemoHistory.generate(today)) {
            incomeService.record(demo.getId(), income.amount(), income.date(), "Demo payment");
        }

        // Logging the history added each payment's spend-now share to the balance. Reset to a low balance so
        // the demo opens on the interesting moment: money is running short.
        UserAccount fresh = users.findById(demo.getId()).orElseThrow();
        fresh.setCurrentBalance(new BigDecimal("900.00"));
        users.save(fresh);
    }
}
