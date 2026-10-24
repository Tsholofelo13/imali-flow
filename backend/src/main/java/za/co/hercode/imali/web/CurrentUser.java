package za.co.hercode.imali.web;

import java.util.UUID;

import org.springframework.security.core.Authentication;

/** The id of the signed-in user. Every query is scoped to this id so users can only ever see their own data. */
final class CurrentUser {

    private CurrentUser() {
    }

    static UUID id(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
