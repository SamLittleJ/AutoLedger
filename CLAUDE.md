# AutoLedger

Aplicație mobilă pentru evidența cheltuielilor unei mașini (revizii, reparații, combustibil, consumabile, accesorii). Proiect de învățare pentru facultate și portofoliu, nu produs nou pe piață.

**Planul complet, cu toate deciziile și motivarea lor: `docs/PLAN.md` (v0.3). Citește-l înainte de orice etapă nouă.**

## Stack

- React Native + Expo + TypeScript, navigare cu Expo Router
- Supabase: Auth, API REST generat, PostgreSQL cu RLS
- Supabase CLI pentru migrații și tipuri generate
- Jest (jest-expo) pentru teste unitare

## Reguli care nu se negociază

- RLS activ pe `vehicles` și `expenses`, cu politicile exact ca în `docs/PLAN.md` §6.
- Proprietarul unei cheltuieli se verifică prin vehicul (EXISTS), în USING **și** WITH CHECK. Nu adăuga `user_id` pe `expenses`.
- Aplicația folosește doar URL-ul și cheia publicabilă, din variabile `EXPO_PUBLIC_*`. Nicio cheie secretă, parolă sau `.env` în cod sau în commit-uri.
- Costul este `numeric(10,2)`, niciodată float. Data cheltuielii (`performed_on`) este `date`, nu `timestamptz`.
- Categoriile se stochează ca coduri ASCII (`service`, `repair`, `consumables`, `fuel`, `accessories`, `other`); etichetele românești sunt doar în interfață.
- Orice modificare de schemă se face printr-o migrație nouă în `supabase/migrations/`, niciodată prin editarea unei migrații deja aplicate. După migrație, regenerează `src/types/database.ts`.

## Decizii deja luate (nu le schimba fără să întrebi)

- **Nume:** tabelul se numește `expenses`, ecranele și textele din interfață folosesc „Cheltuieli”. Nu folosi `maintenance_entries` sau „intervenții”.
- **Kilometraj:** `expenses.odometer` este opțional (NULL permis, altfel `>= 0`). O cheltuială cu kilometraj mai mare decât `current_odometer` îl actualizează printr-un trigger `SECURITY INVOKER`, care nu face nimic când kilometrajul lipsește (condiție `new.odometer is not null` scrisă explicit). Valorile mai mici sunt permise. Kilometrajul mașinii nu scade automat.
- **Combustibil și accesorii:** doar sumă. Fără litri, preț pe litru sau consum mediu.
- **Rezumat lunar:** „Cheltuit luna aceasta” = luna calendaristică curentă, după data locală a telefonului. Se calculează pe client în `src/lib/calc.ts`, comparând prefixul `AAAA-LL` din șirul `performed_on`; nu parsa `performed_on` în `Date`. Doar luna curentă și totalul general.
- **Confirmare email:** dezactivată în săptămânile 1–4; în săptămâna 5 se activează cu redirect către o pagină statică. Fără deep link.
- **Totaluri:** calculate pe client, în funcții pure din `src/lib/calc.ts`, cu teste unitare (inclusiv limitele lunii și trecerea dintre ani).
- **Date din viitor:** respinse în formular, nu prin CHECK în baza de date.

## În afara scopului

Fotografii, notificări, offline, mai multe mașini, export PDF, AI, deep link, ștergerea contului sau a mașinii, litri/preț pe litru/consum mediu, navigare la luni anterioare. Nu le implementa și nu pregăti structuri pentru ele fără o cerere explicită.

## Convenții

- Interfața este în română; codul, identificatorii, comentariile și mesajele de commit sunt în engleză.
- Ecranele în `app/`, logica și clientul în `src/lib/`, componentele comune în `src/components/`.
- Funcțiile de calcul sunt pure și nu importă clientul Supabase.
- Erorile de rețea și de salvare afișează mesaje clare; formularul păstrează datele pentru reîncercare.
- Ștergerea cere confirmare.
- Câmpul de kilometraj din formular este opțional; validarea îl respinge doar dacă e negativ sau nu e număr întreg.

## Comenzi

```bash
npx expo start                 # pornește serverul de dezvoltare (Expo Go)
npx expo lint                  # ESLint
npx tsc --noEmit               # verificarea TypeScript
npm test                       # teste unitare
npx supabase migration new <nume>
npx supabase db push
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```

## Mod de lucru

- Lucrează pe etapa curentă din `docs/PLAN.md` §11. Propune planul etapei înainte de a scrie cod.
- API-urile Expo și Supabase se schimbă des: verifică documentația oficială curentă înainte de a folosi o funcție de configurare, autentificare sau stocare a sesiunii.
- O etapă e terminată doar când lint, `tsc` și testele trec, iar rezultatul verificabil al etapei a fost confirmat.
- După schimbări în politici sau trigger, rulează `scripts/rls-check.ts`.
- Dacă timpul se reduce, se taie în ordinea din `docs/PLAN.md` §13: filtrarea după categorie, apoi rezumatul lunar, apoi confirmarea emailului. Autentificarea, izolarea datelor și fluxul de cheltuieli nu se negociază.
- Pașii de configurare care au funcționat se notează în README.
- Dacă o cerință din plan pare greșită sau incompletă, spune-o înainte de a o implementa altfel.
