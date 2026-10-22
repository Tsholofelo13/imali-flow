package za.co.hercode.imali.model;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name")
    private String displayName;

    @Column(nullable = false)
    private String language = "en";

    /** Total bills the user must cover each month. Drives how much of each payment is set aside. */
    @Column(name = "monthly_obligations", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyObligations = BigDecimal.ZERO.setScale(2);

    /** The user's typical daily spending, used for the runway forecast. */
    @Column(name = "daily_spend", nullable = false, precision = 12, scale = 2)
    private BigDecimal dailySpend = new BigDecimal("100.00");

    /** Spendable money on hand. Grows with each logged payment's spend-now share; the user can correct it. */
    @Column(name = "current_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO.setScale(2);

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public BigDecimal getMonthlyObligations() { return monthlyObligations; }
    public void setMonthlyObligations(BigDecimal monthlyObligations) { this.monthlyObligations = monthlyObligations; }
    public BigDecimal getDailySpend() { return dailySpend; }
    public void setDailySpend(BigDecimal dailySpend) { this.dailySpend = dailySpend; }
    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }
}
