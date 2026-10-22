package za.co.imaliflow.analysis;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class AnalysisController {
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    public record TextRequest(@NotBlank @Size(max = 8000) String text, String language) {}

    private final AiClient ai;
    public AnalysisController(AiClient ai) { this.ai = ai; }

    @PostMapping("/analysis/text")
    public Map<String, Object> text(@Valid @RequestBody TextRequest r) {
        return ai.analyzeText(r.text(), lang(r.language()));
    }

    @PostMapping("/analysis/image")
    public ResponseEntity<?> image(@RequestParam("file") MultipartFile file,
                                   @RequestParam(value = "language", required = false) String language) throws IOException {
        if (file.isEmpty() || !ALLOWED_TYPES.contains(file.getContentType()))
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("error", "Only JPEG, PNG or WebP images up to 5MB"));
        // Forwarded for processing and NOT stored (matches the SSDLC promise).
        return ResponseEntity.ok(ai.analyzeImage(file.getBytes(), "upload", lang(language)));
    }

    @PostMapping("/forecast")
    public Map<String, Object> forecast(@RequestBody Map<String, Object> payload) {
        return ai.forecast(payload);
    }

    private static String lang(String l) { return l != null && Set.of("en", "zu", "st").contains(l) ? l : "en"; }
}
