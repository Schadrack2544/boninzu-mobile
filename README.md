# Boninzu Mobile

Mobile app for browsing property listings, built with Expo and React Native. It is the client for the Boninzu PHP backend, which lives in a separate repository.

## Features

- Browse featured properties and search with filters (keyword, type, listing type, price, bedrooms, bathrooms, location, features, sort)
- Property detail pages
- Sign in (as user, agent or admin) and sign up
- Role-aware dashboard for signed-in users
- Contact form
- Available in English, French and Kinyarwanda; the language follows the device and can be changed in the app

Browsing works without an account. The Dashboard tab appears after sign-in.

## Tech stack

Expo SDK 57, React Native 0.86, React 19, TypeScript (strict), React Navigation 7, axios, i18next, `expo-secure-store`.

## Prerequisites

- Node.js and Yarn
- Android Studio (Android) or Xcode on macOS (iOS), since the app needs a native dev build
- The Boninzu PHP API running and reachable from your device or emulator

## Getting started

```bash
yarn install
```

Set the API address in [src/services/api.ts](src/services/api.ts). `API_BASE_URL` is currently hardcoded to a LAN address, so change it to point at your backend:

```ts
const API_BASE_URL = 'http://<your-machine-ip>/boninzu/api';
```

Then build and run:

```bash
yarn android   # build and run on an Android device or emulator
yarn ios       # build and run on iOS (macOS only)
yarn start     # start the Metro dev server on its own
yarn web       # run in the browser
```

The app does **not** run in Expo Go. It embeds fonts natively and uses a native image-picker module, so use `yarn android` or `yarn ios` to create a dev build. The generated `android/` and `ios/` folders are gitignored; native configuration belongs in [app.json](app.json).

Type-check with:

```bash
npx tsc --noEmit
```

## Project structure

```
App.tsx               Provider setup (i18n, safe area, auth, navigation)
src/
  components/         Shared UI (Button, Field, PropertyCard, Typography, ...)
  context/            AuthContext: session state backed by SecureStore
  i18n/               i18next setup and en / fr / rw translations
  navigation/         Stack and bottom-tab navigators
  screens/            One file per screen
  services/api.ts     axios client and API calls
  theme.ts            Colors, radii, shadows
  types/              Shared TypeScript types
assets/               Icons, splash image, Poppins fonts
```

See [CLAUDE.md](CLAUDE.md) for a deeper tour of the architecture and its gotchas.

## Adding or changing text

All user-facing strings go through i18next. Add every new key to all three files in [src/i18n/locales/](src/i18n/locales/) (`en.ts`, `fr.ts`, `rw.ts`).

## License

MIT. See [LICENSE](LICENSE). The file currently carries Expo's template copyright notice, so update it if the copyright holder should be different.
