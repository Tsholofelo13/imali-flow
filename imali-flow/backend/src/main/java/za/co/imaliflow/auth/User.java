package za.co.imaliflow.auth;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue private UUID id;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String passwordHash;
    private String preferredLanguage = "en";
    private Instant createdAt = Instant.now();

    protected User() {}
    public User(String email, String passwordHash) { this.email = email; this.passwordHash = passwordHash; }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getPreferredLanguage() { return preferredLanguage; }
}
