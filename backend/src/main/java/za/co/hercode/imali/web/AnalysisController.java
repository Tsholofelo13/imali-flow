package za.co.hercode.imali.web;

import java.io.IOException;
import java.util.LinkedHashMap;
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

/**
 * Snap and Explain via the AI service: OCR on a photo, or text that was pasted, then a plain-language
 * explanation with red flags. Needs a signed-in user (see SecurityConfig). Nothing here is stored or logged.
 */
@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    public record TextRequest(@NotBlank @Size(max = 8000) String text, String language) {
    }

    private final AiClient ai;

    public AnalysisController(AiClient ai) {
        this.ai = ai;
    }

    @PostMapping("/text")
    public Map<String, Object> text(@Valid @RequestBody TextRequest request) {
        try {
            return labelled(ai.analyzeText(request.text(), Languages.orEnglish(request.language())));
        } catch (RestClientException e) {
            throw unavailable();
        }
    }

    @PostMapping("/image")
    public Map<String, Object> image(@RequestParam("file") MultipartFile file,
                                     @RequestParam(value = "language", required = false) String language) throws IOException {
        if (file.isEmpty() || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Only JPEG, PNG or WebP images up to 5MB");
        }
        try {
            // Forwarded for processing and NOT stored (matches the SSDLC promise).
            return labelled(ai.analyzeImage(file.getBytes(), "upload", Languages.orEnglish(language)));
        } catch (RestClientException e) {
            throw unavailable();
        }
    }

    private static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "The checker is not available right now. Please try again in a moment.");
    }

    /** Every answer from the AI is marked, so the app can show an "AI-assisted" label next to it. */
    private static Map<String, Object> labelled(Map<String, Object> result) {
        Map<String, Object> out = new LinkedHashMap<>(result);
        out.put("ai_assisted", true);
        out.put("disclaimer", "AI-assisted guidance, not financial advice.");
        return out;
    }
}