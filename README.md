# AutoLedger

An Expo SDK 58 / React Native application for tracking car expenses. Screens live
in `src/app/`, shared components in `src/components/`, and client logic in `src/lib/`.
The interface is in Romanian.

The week 1 client includes email/password sign-up, sign-in, session restoration,
protected routes, and sign-out. The authenticated screen is a temporary placeholder.
No Supabase project is configured yet; real authentication has not been verified.

## Local setup

Install SDK-compatible dependencies:

```bash
npx expo install
```

Supply these public environment variables before starting Expo. `.env.example`
lists their names with empty values; this repository does not provide a `.env` file.

- `EXPO_PUBLIC_SUPABASE_URL`: the Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the project's publishable key.

Both values are required. Never use a secret or service-role key in the app.
Restart Expo after changing the environment variables.

```bash
npx expo start
```

The client stores sessions using `expo-sqlite/localStorage/install` on native and
browser localStorage on web. Native token refresh follows the app's foreground
state. The SQLite module is included in Expo Go.

When a backend is available, disable email confirmation for weeks 1–4 as specified
in `docs/PLAN.md`. If confirmation is enabled, sign-up without a session displays
a message asking the user to confirm their email and then sign in. Confirmation
deep links are outside the current scope.

## Verification

```bash
npx expo lint
npx tsc --noEmit
```

These checks do not require Supabase credentials. Sign-up, sign-in, persisted
sessions across restarts, foreground/background refresh, and sign-out still need
verification on a device once a Supabase project is available.

## References

- [Implementation plan](docs/PLAN.md)
- [Supabase Expo quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [Expo SDK 58 SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/)
- [Expo Router protected routes](https://docs.expo.dev/router/advanced/protected/)
