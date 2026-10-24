package za.co.hercode.imali.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import za.co.hercode.imali.domain.MessageParser.Direction;
import za.co.hercode.imali.domain.MessageParser.Parsed;

class MessageParserTest {

    @Test
    void bankPaymentReceivedIgnoresTheBalance() {
        Parsed p = MessageParser.parse(
                "FNB: R1,500.00 received from J SMITH into acc ..1234 on 24Oct. Avail bal R2,300.00");
        assertEquals(Direction.IN, p.direction());
        assertEquals(new BigDecimal("1500.00"), p.amount());
        assertEquals("Bank message", p.source());
    }

    @Test
    void eWalletIsRecognised() {
        Parsed p = MessageParser.parse("You have received an eWallet of R250 from Thandi.");
        assertEquals(Direction.IN, p.direction());
        assertEquals(new BigDecimal("250.00"), p.amount());
        assertEquals("eWallet", p.source());
    }

    @Test
    void purchaseIsMoneyOut() {
        Parsed p = MessageParser.parse("FNB: R89.99 purchase at SHOPRITE. Avail Bal R500.00");
        assertEquals(Direction.OUT, p.direction());
        assertEquals(new BigDecimal("89.99"), p.amount());
    }

    @Test
    void amountWithSpaceAsThousandsSeparator() {
        Parsed p = MessageParser.parse("Payment received R1 200,50 into your account");
        assertEquals(Direction.IN, p.direction());
        assertEquals(new BigDecimal("1200.50"), p.amount());
    }

    @Test
    void wordsEndingInRAreNotAmounts() {
        Parsed p = MessageParser.parse("Call us or 500 times, no amount here");
        assertNull(p.amount());
    }

    @Test
    void emptyTextGivesNothing() {
        assertNull(MessageParser.parse("   ").amount());
        assertNull(MessageParser.parse(null).amount());
    }
}