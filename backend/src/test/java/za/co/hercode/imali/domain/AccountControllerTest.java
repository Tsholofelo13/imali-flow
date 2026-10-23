package za.co.hercode.imali.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import za.co.hercode.imali.model.UserAccount;
import za.co.hercode.imali.repo.UserRepository;
import za.co.hercode.imali.service.AuditService;
import za.co.hercode.imali.web.AccountController;

class AccountControllerTest {

    private final UserRepository users = mock(UserRepository.class);
    private final AuditService audit = mock(AuditService.class);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final AccountController controller = new AccountController(users, encoder, audit);

    private final UUID id = UUID.randomUUID();
    private final Authentication auth = new UsernamePasswordAuthenticationToken(id.toString(), null);

    private UserAccount account() {
        UserAccount user = new UserAccount();
        user.setEmail("thandi@example.com");
        user.setPasswordHash(encoder.encode("right-password"));
        return user;
    }

    @Test
    void wrongPasswordIsRefusedAndNothingIsDeleted() {
        UserAccount user = account();
        when(users.findById(id)).thenReturn(Optional.of(user));

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> controller.delete(auth, new AccountController.DeleteRequest("wrong-password")));

        assertEquals(HttpStatus.FORBIDDEN, e.getStatusCode());
        verify(users, never()).delete(any());
    }

    @Test
    void rightPasswordDeletesTheAccount() {
        UserAccount user = account();
        when(users.findById(id)).thenReturn(Optional.of(user));

        controller.delete(auth, new AccountController.DeleteRequest("right-password"));

        verify(users).delete(user);
    }
}