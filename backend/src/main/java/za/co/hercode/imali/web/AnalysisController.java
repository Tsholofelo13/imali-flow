package za.co.hercode.imali.web;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import za.co.hercode.imali.ai.AiClient;
import za.co.hercode.imali.domain.OfferAnalyser;
import za.co.hercode.imali.domain.OfferAnalyser.Analysis;
import za.co.hercode.imali.domain.ScamScanner.Flag;

/**
 * Snap and Explain: a photo (read by OCR) or pasted text, then a plain-language explanation with red flags.
 * If the AI is switched off or unavailable, our own rule-based checks answer instead, so the feature keeps working.
 * Needs a signed-in user (see SecurityConfig). Nothing here is stored or logged.
 */
@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    public record TextRequest(@NotBlank @Size(max = 8000) String text, String language) {
    }

    private final AiClient ai;
    private final OfferAnalyser analyser;

    public AnalysisController(AiClient ai, OfferAnalyser analyser) {
        this.ai = ai;
        this.analyser = analyser;
    }

    @PostMapping("/text")
    public Map<String, Object> text(@Valid @RequestBody TextRequest request) {
        try {
            return aiLabelled(ai.analyzeText(request.text(), Languages.orEnglish(request.language())));
        } catch (RestClientException e) {
            // AI off, asleep or failing: answer with the rule-based checker instead of an error.
            return ruleBased(request.text(), null);
        }
    }

    @PostMapping("/image")
    public Map<String, Object> image(@RequestParam("file") MultipartFile file,
                                     @RequestParam(value = "language", required = false) String language) throws IOException {
        if (file.isEmpty() || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Only JPEG, PNG or WebP images up to 5MB");
        }
        Map<String, Object> result;
        try {
            // Forwarded for processing and NOT stored (matches the SSDLC promise).
            result = ai.analyzeImage(file.getBytes(), "upload", Languages.orEnglish(language));
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "We could not read that photo right now. Please try again, or paste the text instead.");
        }
        // The AI service reads the photo but, with no AI key, sends back only the text. Our rules then check it.
        if (result != null && result.get("summary") == null && result.get("extracted_text") instanceof String text
                && !text.isBlank()) {
            return ruleBased(text, text);
        }
        return aiLabelled(result);
    }

    /** Every answer from the AI is marked, so the app can show an "AI-assisted" label next to it. */
    private static Map<String, Object> aiLabelled(Map<String, Object> result) {
        Map<String, Object> out = new LinkedHashMap<>(result);
        out.put("ai_assisted", true);
        out.put("disclaimer", "AI-assisted guidance, not financial advice.");
        return out;
    }

    /** Same shape as the AI answer, built from our own scam rules. English only, and honestly not marked as AI. */
    private Map<String, Object> ruleBased(String text, String extractedText) {
        Analysis analysis = analyser.analyse(text, null);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("document_type", "other");
        out.put("summary", analysis.explanation());
        out.put("red_flags", analysis.flags().stream().map(Flag::message).toList());
        out.put("scam_likelihood", switch (analysis.risk()) {
            case NONE, LOW -> "low";
            case MEDIUM -> "medium";
            case HIGH -> "high";
        });
        out.put("advice", List.of(
                "Do not pay any fee before a loan is paid out.",
                "Never share your PIN, OTP or card details.",
                "Check the lender is registered with the National Credit Regulator (ncr.org.za)."));
        if (extractedText != null) {
            out.put("extracted_text", extractedText);
        }
        out.put("ai_assisted", false);
        out.put("disclaimer", "Rule-based guidance, not checked by AI. Not financial advice.");
        return out;
    }
}