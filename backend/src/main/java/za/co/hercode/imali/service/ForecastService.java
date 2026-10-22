package za.co.hercode.imali.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import za.co.hercode.imali.domain.RunwayForecaster;
import za.co.hercode.imali.domain.RunwayForecaster.Forecast;
import za.co.hercode.imali.domain.RunwayForecaster.Income;
import za.co.hercode.imali.model.UserAccount;
import za.co.hercode.imali.repo.IncomeRepository;
import za.co.hercode.imali.repo.UserRepository;

@Service
public class ForecastService {

    private final UserRepository users;
    private final IncomeRepository incomes;
    private final RunwayForecaster forecaster;
    private final Clock clock;

    public ForecastService(UserRepository users, IncomeRepository incomes, RunwayForecaster forecaster, Clock clock) {
        this.users = users;
        this.incomes = incomes;
        this.forecaster = forecaster;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Forecast forecastFor(UUID userId) {
        UserAccount user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Income> history = incomes.findByUserIdOrderByReceivedOnAsc(userId).stream()
                .map(e -> new Income(e.getReceivedOn(), e.getAmount()))
                .toList();

        return forecaster.forecast(user.getCurrentBalance(), user.getDailySpend(), history, LocalDate.now(clock));
    }
}
