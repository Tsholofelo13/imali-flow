# Imali Flow backend

Spring Boot 3 (Java 21) REST API for Imali Flow: adaptive income splitting, runway forecast, and the Snap and Explain offer and scam analyser.

## Run it locally

```bash
docker compose -f backend/docker-compose.dev.yml up -d   # run from the repo root: PostgreSQL on :5432
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev   # or: mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The `dev` profile sets a local JWT secret and creates the judges' demo account:
`demo@imali.app` / `Demo#Imali2026` (synthetic data only).

Without the `dev` profile the app **refuses to start** unless `IMALI_JWT_SECRET` (32+ characters) is set.
Also set `DB_URL`, `DB_USER`, `DB_PASSWORD` and `IMALI_CORS_ORIGINS` for any shared or deployed environment.

Run the unit tests (no database needed): `mvn test`

## Try it

```bash
# sign in (returns {"token": "..."})
TOKEN=$(curl -s localhost:8080/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"demo@imali.app","password":"Demo#Imali2026"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')

curl -s localhost:8080/api/forecast -H "Authorization: Bearer $TOKEN"

curl -s localhost:8080/api/income -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"amount": 2800, "source": "Market day"}'

curl -s localhost:8080/api/offers/analyse -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"text":"Quick cash! Pay R350 fee first to release your loan.","principal":1000,"totalRepayable":1500,"termDays":30}'
```

## Endpoints

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a token |
| POST | `/api/auth/login` | Sign in, returns a token (5 failed attempts locks the email for 15 min) |
| GET / PUT | `/api/profile` | Monthly bills, daily spend, current balance, language |
| POST | `/api/income` | Log a payment, returns the split (spend now / bills / savings) |
| GET | `/api/income` | The 100 most recent payments |
| GET | `/api/forecast` | Days covered, next expected income, shortfall warning, confidence |
| POST | `/api/analysis/text` | Snap and Explain through the AI service: pasted text in, red flags and explanation out |
| POST | `/api/analysis/image` | Same, from a photo (JPEG, PNG, WebP, up to 5MB). Not stored |
| POST | `/api/offers/analyse` | Snap and Explain: risk, red flags, real cost in rands, plain-language explanation |

Everything except `/api/auth/**` and `/actuator/health` needs `Authorization: Bearer <token>`.
All data is scoped to the signed-in user.

## Where things live

- `domain/` plain Java engines with no framework (easy to test and explain): `IncomeSplitter`, `RunwayForecaster`, `LoanCostCalculator`, `ScamScanner`, `OfferAnalyser`.
- `web/` controllers, `service/` transactions, `model/` + `repo/` JPA, `security/` JWT and login limiter.
- `db/migration/V1__init.sql` the schema (Flyway). Hibernate only validates it.

## Adding the AI explainer

`OfferExplainer` is the seam. `RuleBasedOfferExplainer` is the default. Write another implementation that sends the
findings (risk, flags, cost numbers) to your language model, and register it in `config/AppConfig.java`. Keep the numbers
coming from `LoanCostCalculator` so the model explains them and never invents them. Call translation from the controller
or the explainer to answer in isiZulu or Sesotho.

## Not built yet

Translation, and the language-model explainer inside `/api/offers/analyse` (the AI service handles `/api/analysis/*`). `/api/offers/analyse` is rule-based and takes text plus optional loan numbers.

The backend calls the AI service at `AI_URL` with `AI_INTERNAL_KEY`. If the AI service is down, `/api/analysis/*` returns 503.
