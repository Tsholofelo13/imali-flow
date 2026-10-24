package za.co.hercode.imali.web;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import za.co.hercode.imali.model.UserAccount;
import za.co.hercode.imali.repo.UserRepository;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    public record ProfileResponse(String email, String displayName, String language,
                                  BigDecimal monthlyObligations, BigDecimal dailySpend, BigDecimal currentBalance) {
    }

    /** Partial update: only the fields that are sent are changed. */
    public record ProfileUpdate(
            @Size(max = 80) String displayName,
            @Pattern(regexp = Languages.REGEX, message = Languages.MESSAGE) String language,
            @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal monthlyObligations,
            @DecimalMin("1.00") @Digits(integer = 10, fraction = 2) BigDecimal dailySpend,
            @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal currentBalance) {
    }

    private final UserRepository users;

    public ProfileController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    public ProfileResponse get(Authentication auth) {
        return toResponse(load(auth));
    }

    @PutMapping
    public ProfileResponse update(Authentication auth, @Valid @RequestBody ProfileUpdate update) {
        UserAccount user = load(auth);
        if (update.displayName() != null) user.setDisplayName(update.displayName());
        if (update.language() != null) user.setLanguage(update.language());
        if (update.monthlyObligations() != null) user.setMonthlyObligations(update.monthlyObligations().setScale(2, RoundingMode.HALF_UP));
        if (update.dailySpend() != null) user.setDailySpend(update.dailySpend().setScale(2, RoundingMode.HALF_UP));
        if (update.currentBalance() != null) user.setCurrentBalance(update.currentBalance().setScale(2, RoundingMode.HALF_UP));
        return toResponse(users.save(user));
    }

    private UserAccount load(Authentication auth) {
        return users.findById(CurrentUser.id(auth))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private static ProfileResponse toResponse(UserAccount u) {
        return new ProfileResponse(u.getEmail(), u.getDisplayName(), u.getLanguage(),
                u.getMonthlyObligations(), u.getDailySpend(), u.getCurrentBalance());
    }
}