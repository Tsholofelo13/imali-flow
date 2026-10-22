package za.co.imaliflow.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public record Credentials(@Email String email, @Size(min = 8, max = 100) String password) {}
    public record TokenResponse(String token) {}

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody Credentials c) {
        String email = c.email().trim().toLowerCase();
        if (users.existsByEmail(email)) return ResponseEntity.status(HttpStatus.CONFLICT).build();
        User u = users.save(new User(email, encoder.encode(c.password())));
        return ResponseEntity.status(HttpStatus.CREATED).body(new TokenResponse(jwt.generate(u.getId())));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody Credentials c) {
        return users.findByEmail(c.email().trim().toLowerCase())
                .filter(u -> encoder.matches(c.password(), u.getPasswordHash()))
                .map(u -> ResponseEntity.ok(new TokenResponse(jwt.generate(u.getId()))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
