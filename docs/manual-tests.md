# Manual tests

Phone checks required by `docs/PLAN.md` §10, run in Expo Go. Automated checks
(lint, types, unit tests, `npm run rls-check`) are described in the README.

Record each run in the table at the end: date, device, and any failure.

## Account and session

| # | Steps | Expected |
| --- | --- | --- |
| A1 | Sign up with a new email and password. | The account is created and the app opens the summary (email confirmation is off until week 5). |
| A2 | Sign out from "Mașina mea", then sign in with the same account. | Sign-out returns to the sign-in screen; sign-in opens the summary. |
| A3 | Sign in with a wrong password. | "Emailul sau parola sunt incorecte." is shown; the fields keep their values. |
| A4 | Close the app completely and open it again. | The session is restored without signing in again. |

## No connection (airplane mode)

Turn airplane mode on after the app has loaded, unless a step says otherwise.

| # | Steps | Expected |
| --- | --- | --- |
| N1 | With a saved session, close the app, turn airplane mode on, open the app. | The user stays signed in; screens show the connection message (N2). |
| N2 | Pull to refresh on "Rezumat" or "Istoric", or open the tab fresh. | A clear connection message and a "Reîncearcă" button. After turning airplane mode off, "Reîncearcă" loads the data. |
| N3 | Fill in a new expense and press "Salvează cheltuiala". | A connection message appears under the form; every field keeps its value. After turning airplane mode off, saving again succeeds. |
| N4 | Open an expense, change it, press "Salvează modificările". | Same as N3; the change is saved after reconnecting. |
| N5 | Open an expense, press "Șterge cheltuiala" and confirm. | A connection message appears; the expense is still in the list after reconnecting. |
| N6 | Press "Deconectare" in "Mașina mea". | The app signs out locally and shows the sign-in screen. (After more than an hour offline the access token has expired; then sign-out needs a connection and shows a connection message. See the README limitations.) |

## Expense flow

| # | Steps | Expected |
| --- | --- | --- |
| E1 | Add an expense dated today. | "Cheltuit luna aceasta" and "Total cheltuit" both increase; it is first under "Ultimele cheltuieli". |
| E2 | Add an expense dated in a previous month. | Only "Total cheltuit" increases. |
| E3 | Add an expense with an odometer above the vehicle's. | The vehicle odometer on the summary takes the new value. |
| E4 | Edit an expense: change the cost. | Both totals update after returning. |
| E5 | Delete an expense and confirm. | The dialog names the description, cost and date; the expense disappears and the totals drop. |
| E6 | In "Istoric", pick a category, open and close an expense. | The filter is still active; a category without expenses shows "Arată toate". |

## Account deletion

| # | Steps | Expected |
| --- | --- | --- |
| D1 | With a throwaway account that has a vehicle and an expense: "Mașina mea" → "Șterge contul", enter a wrong password, then the right one. | The wrong password shows "Parola nu este corectă." and nothing is deleted. The right one returns to the sign-in screen with "Contul și datele tale au fost șterse."; signing in again with that account fails. In the Supabase dashboard the user, vehicle and expenses are gone. |
| D2 | Airplane mode on, then "Șterge contul" with the right password. | A connection message; the account still exists. |

## Appearance

| # | Steps | Expected |
| --- | --- | --- |
| T1 | Switch the phone to dark mode, then back to light, with the app open. Visit every screen, open the delete confirmation. | The app follows the phone right away. In both modes: text is readable on every screen, headers, tab bar and status bar match the screen, inputs have a visible border, the active tab and outline buttons use the accent color. |

## Runs

| Date | Device | Result |
| --- | --- | --- |
| 2026-10-27 | Phone, Expo Go (model not recorded) | All checks passed. |
| 2026-10-27 | Phone, Expo Go (model not recorded) | T1 (light and dark appearance) passed after the restyle. |
