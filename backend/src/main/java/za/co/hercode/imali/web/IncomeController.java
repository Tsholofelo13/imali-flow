package za.co.hercode.imali.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import za.co.hercode.imali.service.IncomeService;
import za.co.hercode.imali.service.IncomeService.Recorded;

@RestController
@RequestMapping("/api/income")
public class IncomeController {

    public record IncomeRequest(
            @NotNull @DecimalMin("1.00") @Digits(integer = 10, fraction = 2) BigDecimal amount,
            LocalDate receivedOn, // optional, defaults to today (South African time); future dates are rejected in the service
            @Size(max = 80) String source) {
    }

    public record IncomeView(UUID id, LocalDate receivedOn, BigDecimal amount, String source,
                             BigDecimal spendNow, BigDecimal bills, BigDecimal savings) {
    }

    private final IncomeService service;

    public IncomeController(IncomeService service) {
        this.service = service;
    }

    /** Log a payment. The response is the split: how much to spend now, set aside for bills, and save. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Recorded add(Authentication auth, @Valid @RequestBody IncomeRequest request) {
        return service.record(CurrentUser.id(auth), request.amount(), request.receivedOn(), request.source());
    }

    /** The 100 most recent payments, newest first. */
    @GetMapping
    public List<IncomeView> list(Authentication auth) {
        return service.latest(CurrentUser.id(auth), 100).stream()
                .map(e -> new IncomeView(e.getId(), e.getReceivedOn(), e.getAmount(), e.getSource(),
                        e.getSpendNow(), e.getBills(), e.getSavings()))
                .toList();
    }
}
