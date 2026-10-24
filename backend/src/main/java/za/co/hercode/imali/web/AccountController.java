package za.co.hercode.imali.web;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import za.co.hercode.imali.model.UserAccount;
import za.co.hercode.imali.repo.UserRepository;
import za.co.hercode.imali.service.AuditService;

/** POPIA: the user can erase their account and all their data. */
@RestController
@RequestMapping("/api/account")
public class AccountController {

    public record DeleteRequest(@NotBlank String password) {
    }

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuditService audit;

    public AccountController(UserRepository users, PasswordEncoder encoder, AuditService audit) {
        this.users = users;
        this.encoder = encoder;
        this.audit = audit;
    }

    /**
     * Deletes the signed-in user's account and, through the database's ON DELETE CASCADE, every payment they logged.
     * The password is asked for again so a stolen phone or token cannot wipe the account.
     */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(Authentication auth, @Valid @RequestBody DeleteRequest request) {
        UserAccount user = users.findById(CurrentUser.id(auth))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        if (!encoder.matches(request.password(), user.getPasswordHash())) {
            audit.record(user.getId(), "ACCOUNT_DELETE_REFUSED");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Password is incorrect");
        }
        users.delete(user);
        audit.record(user.getId(), "ACCOUNT_DELETED");
    }
}