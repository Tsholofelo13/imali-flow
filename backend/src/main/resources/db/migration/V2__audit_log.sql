-- Security events (sign-ups, logins, failed logins, account deletion).
-- No foreign key on purpose: events must outlive a deleted account, and they hold only an anonymous id, never an email.
create table audit_log (
    id         bigserial primary key,
    user_id    uuid,
    action     varchar(40) not null,
    created_at timestamptz not null default now()
);

create index ix_audit_log_user on audit_log (user_id, created_at);