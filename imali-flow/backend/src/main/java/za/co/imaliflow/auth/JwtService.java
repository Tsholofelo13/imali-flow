package za.co.imaliflow.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    private final SecretKey key;
    private final long ttlMillis;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.ttl-minutes}") long ttlMinutes) {
        if (secret.length() < 32) throw new IllegalStateException("JWT_SECRET must be at least 32 characters");
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttlMillis = ttlMinutes * 60_000;
    }

    public String generate(UUID userId) {
        long now = System.currentTimeMillis();
        return Jwts.builder().subject(userId.toString())
                .issuedAt(new Date(now)).expiration(new Date(now + ttlMillis))
                .signWith(key).compact();
    }

    /** Returns the user id, or throws if the token is invalid/expired. */
    public UUID parse(String token) {
        String sub = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
        return UUID.fromString(sub);
    }
}
