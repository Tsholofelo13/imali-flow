package za.co.hercode.imali.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** One payment the user received, and how it was split. */
@Entity
@Table(name = "income_event")
public class IncomeEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "received_on", nullable = false)
    private LocalDate receivedOn;

    private String source;

    @Column(name = "spend_now", nullable = false, precision = 12, scale = 2)
    private BigDecimal spendNow;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal bills;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal savings;

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getReceivedOn() { return receivedOn; }
    public void setReceivedOn(LocalDate receivedOn) { this.receivedOn = receivedOn; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public BigDecimal getSpendNow() { return spendNow; }
    public void setSpendNow(BigDecimal spendNow) { this.spendNow = spendNow; }
    public BigDecimal getBills() { return bills; }
    public void setBills(BigDecimal bills) { this.bills = bills; }
    public BigDecimal getSavings() { return savings; }
    public void setSavings(BigDecimal savings) { this.savings = savings; }
}
