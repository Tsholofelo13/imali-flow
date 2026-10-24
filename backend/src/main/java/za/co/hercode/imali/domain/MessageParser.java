package za.co.hercode.imali.domain;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Reads a bank or eWallet payment SMS and finds the rand amount and whether the money came in or went out.
 * Works on the wording of the message, not on any bank's API, so it works for FNB-style messages and others.
 * Pure text in, result out: nothing is stored or logged, because the message can contain personal details.
 */
public final class MessageParser {

    public enum Direction { IN, OUT, UNKNOWN }

    /** @param amount null when no rand amount was found */
    public record Parsed(Direction direction, BigDecimal amount, String source) {
    }

    // "R1,500.00", "R 250", "R1 200,50". The R must not be part of a word (so "or 500" is not an amount).
    private static final Pattern AMOUNT =
            Pattern.compile("(?<![A-Za-z])R\\s?(\\d{1,3}(?:[ ,]\\d{3})+|\\d{1,9})(?:[.,](\\d{2}))?(?!\\d)");

    private static final List<String> MONEY_IN = List.of(
            "received", "deposit", "credited", "paid into", "payment from", "money in", "has been paid to you",
            "sent you");
    private static final List<String> MONEY_OUT = List.of(
            "purchase", "withdrawal", "withdrew", "debited", "paid to", "sent to", "transferred to", "payment to",
            "debit order", "airtime", "bought");

    private static final BigDecimal MIN = new BigDecimal("1.00");
    private static final BigDecimal MAX = new BigDecimal("9999999.99");

    private MessageParser() {
    }

    public static Parsed parse(String text) {
        if (text == null || text.isBlank()) {
            return new Parsed(Direction.UNKNOWN, null, "Bank message");
        }
        String lower = text.toLowerCase();
        return new Parsed(direction(lower), amount(text, lower), source(lower));
    }

    private static BigDecimal amount(String text, String lower) {
        Matcher m = AMOUNT.matcher(text);
        while (m.find()) {
            // Skip balances and fees: "Avail Bal R2,300.00" is not the payment.
            String before = lower.substring(Math.max(0, m.start() - 15), m.start());
            if (before.contains("bal") || before.contains("avail") || before.contains("fee")) {
                continue;
            }
            String whole = m.group(1).replace(",", "").replace(" ", "");
            String cents = m.group(2) == null ? "00" : m.group(2);
            BigDecimal value = new BigDecimal(whole + "." + cents);
            if (value.compareTo(MIN) >= 0 && value.compareTo(MAX) <= 0) {
                return value;
            }
        }
        return null;
    }

    /** Whichever clue appears first in the message decides. */
    private static Direction direction(String lower) {
        int in = firstIndex(lower, MONEY_IN);
        int out = firstIndex(lower, MONEY_OUT);
        if (in < 0 && out < 0) return Direction.UNKNOWN;
        if (out < 0) return Direction.IN;
        if (in < 0) return Direction.OUT;
        return in < out ? Direction.IN : Direction.OUT;
    }

    private static int firstIndex(String lower, List<String> clues) {
        int best = -1;
        for (String clue : clues) {
            int i = lower.indexOf(clue);
            if (i >= 0 && (best < 0 || i < best)) {
                best = i;
            }
        }
        return best;
    }

    private static String source(String lower) {
        return lower.contains("ewallet") || lower.contains("e-wallet") ? "eWallet" : "Bank message";
    }
}