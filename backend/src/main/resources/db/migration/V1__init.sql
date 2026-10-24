create table app_user (
    id                  uuid primary key,
    email               varchar(254)  not null,
    password_hash       varchar(100)  not null,
    display_name        varchar(80),
    language            varchar(5)    not null default 'en',
    monthly_obligations numeric(12,2) not null default 0 check (monthly_obligations >= 0),
    daily_spend         numeric(12,2) not null default 100 check (daily_spend > 0),
    current_balance     numeric(12,2) not null default 0 check (current_balance >= 0),
    created_at          timestamptz   not null default now()
);

-- Emails are unique regardless of upper/lower case.
create unique index ux_app_user_email on app_user (lower(email));

create table income_event (
    id          uuid primary key,
    user_id     uuid          not null references app_user (id) on delete cascade,
    amount      numeric(12,2) not null check (amount > 0),
    received_on date          not null,
    source      varchar(80),
    spend_now   numeric(12,2) not null,
    bills       numeric(12,2) not null,
    savings     numeric(12,2) not null,
    created_at  timestamptz   not null default now()
);

create index ix_income_event_user_date on income_event (user_id, received_on);
