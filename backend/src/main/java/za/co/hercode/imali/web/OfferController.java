package za.co.hercode.imali.web;

import java.math.BigDecimal;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import za.co.hercode.imali.domain.LoanCostCalculator.LoanQuote;
import za.co.hercode.imali.domain.OfferAnalyser;
import za.co.hercode.imali.domain.OfferAnalyser.Analysis;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    /**
     * @param text           the offer or message (typed, pasted, or read from a photo by OCR)
     * @param principal      optional: amount borrowed
     * @param totalRepayable optional: total to pay back
     * @param termDays       optional: days to repay. The three loan numbers go together.
     */
    public record OfferRequest(
            @NotBlank @Size(max = 4000) String text,
            @DecimalMin("0.01") BigDecimal principal,
            @DecimalMin("0.01") BigDecimal totalRepayable,
            @Min(1) @Max(3650) Integer termDays) {
    }

    private final OfferAnalyser analyser;

    public OfferController(OfferAnalyser analyser) {
        this.analyser = analyser;
    }

    /**
     * Snap and Explain. The text is analysed and then discarded: it is never stored or written to logs,
     * because it may contain personal or financial details.
     */
    @PostMapping("/analyse")
    public Analysis analyse(@Valid @RequestBody OfferRequest request) {
        boolean any = request.principal() != null || request.totalRepayable() != null || request.termDays() != null;
        boolean all = request.principal() != null && request.totalRepayable() != null && request.termDays() != null;
        if (any && !all) {
            throw new IllegalArgumentException("Send principal, totalRepayable and termDays together, or none of them");
        }
        LoanQuote quote = all
                ? new LoanQuote(request.principal(), request.totalRepayable(), request.termDays())
                : null;
        return analyser.analyse(request.text(), quote);
    }
}
