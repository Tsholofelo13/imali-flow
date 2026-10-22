# Imali Flow (Her_Code, FNB AOTY Hackathon 2026)

```
mobile (Expo / React Native) -> backend (Spring Boot :8080) -> ai-service (FastAPI, internal only)
                                       |                           |- Tesseract OCR
                                  PostgreSQL                       |- LLM API (key lives here only)
                                                                   |- runway forecast
```

## Prerequisites
Docker Desktop, Node 20+. Android Studio emulator, or the Expo Go app on a phone.
(Only if running without Docker: JDK 21, Maven, Python 3.12, Tesseract.)

## Run backend + AI + database
```bash
cp .env.example .env        # fill in secrets and ANTHROPIC_API_KEY
docker compose up --build
curl localhost:8080/actuator/health
```

## Run the mobile app
```bash
cd mobile
cp .env.example .env        # set EXPO_PUBLIC_API_URL
npm install
npx expo start              # 'a' = Android emulator, or scan the QR with Expo Go
```

## Try the API
```bash
curl -X POST localhost:8080/api/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"demo@imali.test","password":"Demo-pass-123"}'
curl -X POST localhost:8080/api/analysis/text -H "Authorization: Bearer <token>" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Pay R200 fee to release your R5000 loan","language":"en"}'
```

## Tests
`cd backend && mvn test` | `cd ai-service && pytest` | `cd mobile && npm run lint`

## Submission reminders
- Seed a demo account with synthetic data only; put the login on a slide.
- Android build: `npx eas build -p android --profile preview` (free Expo account) then submit the .apk.
- Keep SSDLC claims and the code in sync.

## TODO (SSDLC promises not yet implemented)
- [ ] Login rate limiting (e.g. Bucket4j)
- [ ] Audit log table and writes
- [ ] Refresh-token flow
- [ ] Income/expense entities and endpoints (needed for adaptive split and forecast)
- [ ] Account and data deletion endpoint
- [ ] isiZulu / Sesotho OCR language packs if needed
