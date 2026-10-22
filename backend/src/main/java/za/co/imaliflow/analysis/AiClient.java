package za.co.imaliflow.analysis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import java.util.Map;

/** All calls to the Python AI service go through here. API keys never leave the server. */
@Component
public class AiClient {
    private final RestClient http;

    public AiClient(@Value("${app.ai.url}") String url, @Value("${app.ai.internal-key}") String key) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(45_000);
        this.http = RestClient.builder().baseUrl(url).requestFactory(factory)
                .defaultHeader("X-Internal-Key", key).build();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeText(String text, String language) {
        return http.post().uri("/analyze/text").contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("text", text, "language", language)).retrieve().body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeImage(byte[] bytes, String filename, String language) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(bytes) {
            @Override public String getFilename() { return filename; }
        });
        body.add("language", language);
        return http.post().uri("/analyze/image").contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body).retrieve().body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> forecast(Map<String, Object> payload) {
        return http.post().uri("/forecast/runway").contentType(MediaType.APPLICATION_JSON)
                .body(payload).retrieve().body(Map.class);
    }
}
