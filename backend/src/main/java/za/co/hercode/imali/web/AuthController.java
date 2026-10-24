package za.co.hercode.imali.web;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import za.co.hercode.imali.model.UserAccount;
import za.co.hercode.imali.repo.UserRepository;
import za.co.hercode.imali.security.JwtService;
import za.co.hercode.imali.security.LoginRateLimiter;
import za.co.hercode.imali.service.AuditService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 254) String email,
            // BCrypt only uses the first 72 bytes, so longer passwords are rejected rather than silently truncated.
            @NotBlank @Size(min = 8, max = 72) String password,
            @Size(max = 80) String displayName,
            @Pattern(regexp = Languages.REGEX, message = Languages.MESSAGE) String language) {
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {
    }

    public record TokenResponse(String token) {
    }

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LoginRateLimiter limiter;
    private final AuditService audit;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt, LoginRateLimiter limiter,
                          AuditService audit) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.limiter = limiter;
        this.audit = audit;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TokenResponse register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That email is already registered");
        }
        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        if (request.language() != null) {
            user.setLanguage(request.language());
        }
        users.save(user);
        audit.record(user.getId(), "REGISTER");
        return new TokenResponse(jwt.issue(user.getId()));
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (limiter.isBlocked(email)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Try again in 15 minutes.");
        }
        UserAccount user = users.findByEmailIgnoreCase(email).orElse(null);
        // Same answer for "no such user" and "wrong password" so the API does not reveal which emails exist.
        if (user == null || !encoder.matches(request.password(), user.getPasswordHash())) {
            limiter.recordFailure(email);
            audit.record(user == null ? null : user.getId(), "LOGIN_FAILED");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong email or password");
        }
        limiter.reset(email);
        audit.record(user.getId(), "LOGIN");
        return new TokenResponse(jwt.issue(user.getId()));
    }
}