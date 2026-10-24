package za.co.hercode.imali.web;

import java.util.Set;

/** The eleven official languages the app supports. One list, used everywhere, so they can never drift apart. */
public final class Languages {

    /** Codes: English, isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, Sepedi, Xitsonga, siSwati, Tshivenda, isiNdebele. */
    public static final String REGEX = "en|zu|xh|af|st|tn|nso|ts|ss|ve|nr";

    public static final String MESSAGE = "language must be one of en, zu, xh, af, st, tn, nso, ts, ss, ve, nr";

    public static final Set<String> CODES = Set.of("en", "zu", "xh", "af", "st", "tn", "nso", "ts", "ss", "ve", "nr");

    private Languages() {
    }

    /** Unknown or missing codes fall back to English. */
    public static String orEnglish(String code) {
        return code != null && CODES.contains(code) ? code : "en";
    }
}