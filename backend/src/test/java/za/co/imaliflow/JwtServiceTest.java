package za.co.imaliflow;

import org.junit.jupiter.api.Test;
import za.co.imaliflow.auth.JwtService;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String SECRET = "0123456789abcdef0123456789abcdef";

    @Test void roundTrip() {
        JwtService s = new JwtService(SECRET, 5);
        UUID id = UUID.randomUUID();
        assertEquals(id, s.parse(s.generate(id)));
    }
    @Test void rejectsTamperedToken() {
        JwtService s = new JwtService(SECRET, 5);
        String t = s.generate(UUID.randomUUID());
        assertThrows(Exception.class, () -> s.parse(t + "x"));
    }
}
