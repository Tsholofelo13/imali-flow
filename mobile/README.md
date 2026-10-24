# Imali Flow mobile (Expo React Native)

Matches the backend handover of 24 Oct 2026.

## Run
```bash
cp .env.example .env     # set EXPO_PUBLIC_API_URL (and the demo login, locally only)
npm install
npx expo install --check # lets Expo fix any version mismatches
npx expo start           # press a for the Android emulator, or scan the QR with Expo Go
```

## Android APK for submission
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
Use the https hosted API URL for release builds (Android blocks plain http).

## Folders
- App.tsx: start-up, picks which screen shows
- src/api: client.ts (token, errors, 401), services.ts (one function per endpoint), status.ts (waking-up detection)
- src/context: SettingsContext (language, large text), AuthContext (token, profile)
- src/screens: one file per screen
- src/components: shared building blocks
- src/i18n: 11 language codes, English text, draft isiZulu and Sesotho
- src/types.ts, src/theme.ts, src/utils

## Rules followed
AI results always carry the AI label. Photos and text are never stored or logged. A slow first request shows "waking up". A null shortfall shows green. Forecast and rule messages are English only, so other languages get sentences built from the numbers.
