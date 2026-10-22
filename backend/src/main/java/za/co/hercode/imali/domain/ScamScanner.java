package za.co.hercode.imali.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Rule-based baseline for spotting scam and predatory-lending patterns in a message or offer.
 *
 * This is the always-available, explainable layer. An AI model can sit on top of it (see OfferExplainer),
 * but these rules keep working offline, cost nothing and never invent findings.
 * It is a heuristic: "no flags" does NOT mean an offer is safe.
 */
public class ScamScanner {

    public enum Severity { LOW, MEDIUM, HIGH }

    public record Flag(Severity severity, String code, String message) {
    }

    private record Rule(Severity severity, String code, Pattern pattern, String message) {
    }

    private static final int F = Pattern.CASE_INSENSITIVE | Pattern.DOTALL;

    private static final List<Rule> RULES = List.of(
            new Rule(Severity.HIGH, "ADVANCE_FEE",
                    Pattern.compile("(up-?front|advance)\\s+(fee|payment|deposit)"
                            + "|(pay|send|deposit|transfer).{0,40}(fee|deposit|insurance|admin|processing).{0,60}"
                            + "(before|first|to (release|unlock|activate|receive|get))", F),
                    "Asks you to pay a fee BEFORE you get the money. Real lenders take their costs from the loan or the repayments. This is the most common loan scam."),
            new Rule(Severity.HIGH, "COLLATERAL_CARD",
                    Pattern.compile("(keep|hold|retain|surrender|hand over|leave).{0,30}"
                            + "\\b(sassa card|bank card|atm card|your card|card and pin)\\b", F),
                    "Wants to hold your bank or SASSA card. Lenders may not keep your card or PIN. This is illegal and a common loan-shark practice."),
            new Rule(Severity.MEDIUM, "GUARANTEED_APPROVAL",
                    Pattern.compile("guaranteed\\s+(approval|loan|cash)|no\\s+credit\\s+check"
                            + "|blacklisted\\s+(ok|accepted|welcome)|100%\\s+(approval|approved)", F),
                    "Promises approval with no checks. Registered lenders must assess whether you can afford the loan."),
            new Rule(Severity.MEDIUM, "SHORT_LINK",
                    Pattern.compile("(bit\\.ly|tinyurl\\.com|cutt\\.ly|goo\\.gl|wa\\.me|is\\.gd|t\\.co/)", F),
                    "Uses a shortened link, which hides where it really goes. Do not tap it."),
            new Rule(Severity.MEDIUM, "ACCOUNT_THREAT",
                    Pattern.compile("(account|card|profile).{0,30}(suspended|blocked|locked|frozen|deactivated)", F),
                    "Threatens to block your account, a common phishing trick. Phone your bank on the number on the back of your card."),
            new Rule(Severity.LOW, "URGENCY",
                    Pattern.compile("urgent|act now|last chance|expires?\\s+(today|tonight|soon)"
                            + "|within\\s+\\d+\\s+(hours?|minutes?)", F),
                    "Pushes you to act fast. Scammers use pressure so you do not have time to think or ask someone.")
    );

    private static final Pattern SHARE_SECRET = Pattern.compile(
            "(send|share|give|provide|reply with|confirm).{0,25}\\b(otp|pin|password|cvv)\\b"
                    + "|one[- ]time\\s+(pin|password)", F);
    private static final Pattern MENTIONS_CREDIT = Pattern.compile(
            "\\b(loan|borrow|credit|cash advance|payday)\\b", F);
    private static final Pattern MENTIONS_NCR = Pattern.compile(
            "\\bncr\\b|ncrcp|national credit regulator", F);

    public List<Flag> scan(String text) {
        List<Flag> flags = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return flags;
        }
        String lower = text.toLowerCase(Locale.ROOT);

        for (Rule r : RULES) {
            if (r.pattern().matcher(text).find()) {
                flags.add(new Flag(r.severity(), r.code(), r.message()));
            }
        }

        // Banks often print "never share your OTP". Skip this rule for such warnings to avoid crying wolf.
        boolean isWarning = lower.contains("never share") || lower.contains("do not share") || lower.contains("don't share");
        if (!isWarning && SHARE_SECRET.matcher(text).find()) {
            flags.add(new Flag(Severity.HIGH, "ASKS_FOR_SECRET",
                    "Asks for your PIN, password or OTP. No bank or genuine lender will ever ask for these."));
        }

        if (MENTIONS_CREDIT.matcher(text).find() && !MENTIONS_NCR.matcher(text).find()) {
            flags.add(new Flag(Severity.LOW, "NO_NCR_NUMBER",
                    "No NCR registration number shown. Lenders must be registered with the National Credit Regulator. Check at ncr.org.za before paying anything."));
        }
        return flags;
    }
}
