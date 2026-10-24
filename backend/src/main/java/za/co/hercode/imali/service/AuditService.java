package za.co.hercode.imali.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Writes security events to the audit_log table. Stores only the anonymous user id and an action name,
 * never emails, passwords or request contents (POPIA data minimisation).
 */
@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final JdbcTemplate jdbc;

    public AuditService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Own transaction, so an event is kept even if the request that caused it is rolled back or refused. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(UUID userId, String action) {
        try {
            jdbc.update("insert into audit_log (user_id, action) values (?, ?)", userId, action);
        } catch (DataAccessException e) {
            // Never let a logging problem break the user's request.
            log.warn("Could not write audit event {}", action);
        }
    }
}