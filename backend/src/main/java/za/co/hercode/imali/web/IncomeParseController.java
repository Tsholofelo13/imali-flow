package za.co.hercode.imali.web;

import java.math.BigDecimal;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import za.co.hercode.imali.domain.MessageParser;
import za.co.hercode.imali.domain.MessageParser.Parsed;

/**
 * Reads a pasted payment SMS and says what it found. It saves nothing: the app shows the result, the user
 * confirms, and the app then calls POST /api/income with the amount and source. The text is never stored or logged.
 */
@RestController
@RequestMapping("/api/income/parse")
public class IncomeParseController {

    public record ParseRequest(@NotBlank @Size(max = 1000) String text) {
    }

    /** direction is IN, OUT, UNKNOWN, or NONE when no rand amount was found. */
    public record ParseResponse(String direction, BigDecimal amount, String source, String message) {
    }

    @PostMapping
    public ParseResponse parse(@Valid @RequestBody ParseRequest request) {
        Parsed p = MessageParser.parse(request.text());
        if (p.amount() == null) {
            return new ParseResponse("NONE", null, p.source(), "We could not find a rand amount in that message.");
        }
        return switch (p.direction()) {
            case IN -> new ParseResponse("IN", p.amount(), p.source(),
                    "We found a payment of R" + p.amount().toPlainString() + ". Add it?");
            case OUT -> new ParseResponse("OUT", p.amount(), p.source(),
                    "That looks like money going out, not a payment you received.");
            case UNKNOWN -> new ParseResponse("UNKNOWN", p.amount(), p.source(),
                    "We found R" + p.amount().toPlainString() + " but could not tell if it was money in. Check before adding.");
        };
    }
}