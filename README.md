# AutoLedger

[![CI](https://github.com/SamLittleJ/AutoLedger/actions/workflows/ci.yml/badge.svg)](https://github.com/SamLittleJ/AutoLedger/actions/workflows/ci.yml)

AutoLedger is a mobile app for recording a car's expenses (service, repairs, fuel,
consumables, accessories), reviewing the history, and seeing monthly and total
spending in RON. It is a learning project built for a university course and for
a portfolio. The domain is well known and similar apps exist (for example Drivvo
and Fuelio), so the emphasis is on execution: tested data isolation, a clean
schema, and documentation. The user interface is in Romanian.

## Status

Work in progress, following a 5-week plan. Week 1 (authentication and the
`vehicles` table with Row Level Security) is complete and verified on a phone. The full plan, including
design decisions and scope, is in [docs/PLAN.md](docs/PLAN.md) (in Romanian).

## Tech stack

- React Native with Expo SDK 58 and TypeScript
- Expo Router for navigation
- Supabase: Auth, PostgreSQL with Row Level Security, auto-generated REST API
- Supabase CLI for versioned SQL migrations
- Jest with jest-expo for unit tests

## Security model

- Row Level Security is enabled on every table.
- Policies compare against `(select auth.uid())`, as recommended by Supabase for
  query performance.
- The app uses only the Supabase URL and the publishable key, read from
  `EXPO_PUBLIC_*` environment variables. No secret keys, database passwords or
  `.env` files are committed.
- Expense ownership is checked through the associated vehicle with an `EXISTS`
  condition in both `USING` and `WITH CHECK`; `expenses` has no `user_id`
  column.
- A cross-account script (`scripts/rls-check.ts`) verifies the isolation
  through the REST API, using only the publishable key (see below).

## Getting started

Prerequisites:

- Node.js 22
- Expo Go installed on a phone
- A Supabase project

```bash
npm install
```

Copy the environment template and fill in the values from your Supabase project
(Project Settings, API):

```bash
cp .env.example .env
# set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Use the base project URL (`https://<ref>.supabase.co`), not the Data API endpoint
ending in `/rest/v1/`; otherwise every auth request returns 404.

Apply the database migrations:

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push
```

During development, disable "Confirm email" in the Supabase Auth settings. The
plan enables it again in week 5.

Start the development server and scan the QR code with Expo Go:

```bash
npx expo start
```

## Checks

```bash
npx expo lint
npx tsc --noEmit
npm test
```

### RLS check

`scripts/rls-check.ts` signs in as two dedicated test accounts, A and B, and
tries to read, insert, update and delete A's vehicle and expenses as B,
including inserting an expense on A's vehicle and moving one of B's expenses
onto it. Every attempt must fail or affect zero rows; an anonymous client must
see nothing. It also checks that the odometer trigger raises
`current_odometer` only for a higher reading. Test rows are removed at the end.

```bash
cp .env.test.example .env.test
# fill in the Supabase URL, publishable key and the two test accounts
npm run rls-check
```

Create both accounts in the app first. Do not use a real account: the script
writes data. Run it again after any change to policies or the trigger.

The lint, type and unit checks run in GitHub Actions on every push and pull request
(see [.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Project structure

```
src/
  app/          Expo Router screens and layouts ((auth) and (app) groups)
  components/   Shared UI components
  lib/          Supabase client, data access, validation, pure helpers
  types/        Generated database types
scripts/
  rls-check.ts  Cross-account RLS and trigger check
supabase/
  migrations/  Versioned SQL migrations (schema, RLS policies)
docs/
  PLAN.md       Implementation plan and design decisions (Romanian)
```

## Known limitations

- Supabase free-tier projects pause after a period of inactivity. Resume the
  project in the Supabase dashboard before a demonstration.
- The app works online only; there is no offline mode.
- One vehicle per account.
- Email confirmation links do not open the app (no deep link). Out of scope.

## License

MIT. See [LICENSE](LICENSE).
