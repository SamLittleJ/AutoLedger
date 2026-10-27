# AutoLedger — Planul aplicației mobile

Versiunea 0.4 · 27 octombrie 2026 · Durată de lucru: 5 săptămâni

Versiunea 0.4 păstrează planul v0.3 neschimbat și adaugă la final secțiunea 15, cu deciziile luate în timpul implementării.

Versiunea 0.3 extinde planul v0.2 cu evidența cheltuielilor de zi cu zi (combustibil, accesorii, lichid de parbriz etc.) și cu rezumatul „Cheltuit luna aceasta”. Tabelul `maintenance_entries` devine `expenses`, iar „intervenții” devin „cheltuieli”. Kilometrajul unei cheltuieli devine opțional. Fiindcă nu există încă SQL sau cod, redenumirea nu costă nimic.

AutoLedger este o aplicație în care proprietarul unei mașini își înregistrează cheltuielile legate de ea (revizii, reparații, combustibil, consumabile, accesorii), consultă istoricul și vede cât a cheltuit. Livrăm o versiune funcțională pentru facultate, documentată astfel încât să poată fi prezentată și în portofoliu. Aplicația nu este un produs nou pe piață; valoarea ei stă în execuție: izolarea datelor testată, schemă curată, documentație bună.

Stack: React Native cu Expo și TypeScript, conectat la Supabase pentru autentificare, API și PostgreSQL. AutoLedger rămâne numele de lucru.

---

## 1. Scopul primei versiuni

- Cont cu email și parolă: înregistrare, conectare, păstrarea sesiunii, deconectare.
- O singură mașină per cont: marcă, model, an opțional, kilometraj curent.
- Cheltuieli cu dată, categorie, descriere, cost, kilometraj **opțional** și observații opționale: adăugare, editare, ștergere. Combustibilul și accesoriile se notează doar ca sumă, fără litri sau preț pe litru.
- Istoric ordonat după dată, cu filtrare după categorie.
- Rezumat cu „Cheltuit luna aceasta”, totalul general și ultimele cheltuieli. Moneda: RON.
- Salvare online; fiecare utilizator are acces exclusiv la propriile date.

## 2. Ecranele aplicației

| Ecran | Ce poate face utilizatorul |
| --- | --- |
| Acces în cont | Se înregistrează și se conectează. Confirmarea emailului: vezi decizia D2. |
| Rezumat | Vede „Cheltuit luna aceasta” (luna calendaristică curentă), totalul general și ultimele 5 cheltuieli. |
| Istoric | Consultă cheltuielile și le filtrează după categorie. |
| Adăugare / editare | Completează și validează datele unei cheltuieli (kilometrajul poate lipsi); o poate șterge, cu confirmare. |
| Mașina mea | Adaugă sau modifică vehiculul și se deconectează. |

Dacă utilizatorul nu are încă o mașină, Rezumat și Istoric afișează o stare goală cu buton spre „Mașina mea”.

## 3. În afara scopului (v1)

Aplicația lucrează online. Următoarele sunt extensii ulterioare și **nu** se implementează acum:

- fotografii, notificări, sincronizare offline;
- mai multe mașini per cont, export PDF, funcții AI;
- litri, preț pe litru și consum mediu pentru combustibil (rămâne doar suma);
- navigare la luni anterioare în rezumat (doar luna curentă și totalul general);
- deep link pentru confirmarea emailului (vezi D2);
- ștergerea contului sau a mașinii;
- publicarea în magazinele de aplicații.

Prima demonstrație se face pe un telefon real, prin Expo Go.

---

## 4. Arhitectura și tehnologiile

Aplicația mobilă folosește clientul Supabase pentru autentificare și pentru operațiile asupra datelor. Supabase generează API-ul REST din structura bazei de date. Politicile Row Level Security (RLS) controlează ce înregistrări poate accesa fiecare cont.

| Tehnologie | Rol în proiect |
| --- | --- |
| React Native + Expo | Interfața mobilă și mediul de dezvoltare; testare prin Expo Go. |
| TypeScript + Expo Router | Tipuri pentru date și navigare între ecrane. |
| @supabase/supabase-js | Clientul pentru autentificare și acces la API. |
| Supabase Auth | Conturi, verificarea credențialelor, gestionarea sesiunii. |
| PostgreSQL + API REST | Persistență, relații, constrângeri, trigger, operații CRUD. |
| Supabase CLI | Migrații SQL versionate și generarea tipurilor TypeScript. |
| Jest (jest-expo) | Teste unitare pentru funcțiile de calcul. |
| Git + GitHub | Istoric, sarcini, documentație. |

Surse oficiale de urmat: Expo „Using Supabase”, Supabase Data REST API, Supabase Row Level Security, Supabase React Native Auth. API-urile se schimbă: se verifică documentația curentă înainte de implementare.

---

## 5. Modelul de date

Folosim utilizatorii administrați de Supabase Auth și două tabele proprii, în schema `public`. Un utilizator are cel mult o mașină; o mașină are oricâte cheltuieli.

### `vehicles`

| Coloană | Tip | Reguli |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | NOT NULL, **UNIQUE**, FK → `auth.users(id)` `ON DELETE CASCADE`, default `auth.uid()` |
| `make` | `text` | NOT NULL, nu poate fi gol după trim |
| `model` | `text` | NOT NULL, nu poate fi gol după trim |
| `year` | `smallint` | opțional, CHECK între 1900 și 2100 |
| `current_odometer` | `integer` | NOT NULL, default 0, CHECK `>= 0` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

### `expenses`

| Coloană | Tip | Reguli |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `vehicle_id` | `uuid` | NOT NULL, FK → `vehicles(id)` `ON DELETE CASCADE`, **indexat** |
| `performed_on` | `date` | NOT NULL (tip `DATE`, nu `timestamptz`, ca să nu se mute data din cauza fusului orar) |
| `category` | `text` | NOT NULL, CHECK în (`service`, `repair`, `consumables`, `fuel`, `accessories`, `other`) |
| `description` | `text` | NOT NULL, nu poate fi gol după trim |
| `odometer` | `integer` | **NULL permis**; dacă există, CHECK `>= 0` |
| `cost` | `numeric(10,2)` | NOT NULL, CHECK `>= 0` |
| `notes` | `text` | opțional |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

### Categorii

În baza de date se stochează coduri ASCII; interfața afișează etichetele în română.

| Cod | Etichetă | Exemple |
| --- | --- | --- |
| `service` | Revizie | schimb de ulei, filtre |
| `repair` | Reparație | plăcuțe de frână, alternator |
| `consumables` | Consumabile | lichid de parbriz, antigel |
| `fuel` | Combustibil | alimentare |
| `accessories` | Accesorii | covorașe, suport de telefon |
| `other` | Altele | parcare, spălătorie, taxe |

### Ordonare

Istoricul și „ultimele cheltuieli” se ordonează după `performed_on` descrescător, apoi după `created_at` descrescător.

---

## 6. Reguli de acces (RLS)

RLS este activat pe ambele tabele. Politicile se aplică rolului `authenticated`; rolul `anon` nu are nicio politică, deci nu vede nimic. În politici se folosește `(select auth.uid())`, nu `auth.uid()` direct, conform recomandării Supabase pentru performanță.

### `vehicles`

| Operație | Condiție |
| --- | --- |
| SELECT | `user_id = (select auth.uid())` |
| INSERT | WITH CHECK `user_id = (select auth.uid())` |
| UPDATE | USING și WITH CHECK `user_id = (select auth.uid())` |
| DELETE | fără politică (ștergerea nu e în scop) |

### `expenses`

Proprietarul se verifică prin vehiculul asociat (decizia D3). Condiția comună, notată **C**:

```sql
exists (
  select 1 from public.vehicles v
  where v.id = expenses.vehicle_id
    and v.user_id = (select auth.uid())
)
```

| Operație | Condiție |
| --- | --- |
| SELECT | USING **C** |
| INSERT | WITH CHECK **C** |
| UPDATE | USING **C** și WITH CHECK **C** (împiedică mutarea unei cheltuieli pe vehiculul altcuiva) |
| DELETE | USING **C** |

RLS nu înlocuiește drepturile de acces la nivel de tabel: se verifică faptul că rolul `authenticated` are drepturile necesare pe ambele tabele.

---

## 7. Decizii luate

### D1. Kilometrajul

- Kilometrajul unei cheltuieli este **opțional**. Nimeni nu notează kilometrajul când cumpără lichid de parbriz sau când alimentează în grabă.
- Dacă există, poate fi orice valoare nenegativă, inclusiv mai mică decât kilometrajul curent (permite introducerea istoricului vechi).
- Dacă o cheltuială nouă sau editată are kilometrajul mai mare decât `vehicles.current_odometer`, kilometrajul mașinii se actualizează automat. Dacă kilometrajul lipsește, trigger-ul nu face nimic.
- Implementare: trigger `AFTER INSERT OR UPDATE OF odometer` pe `expenses`, care rulează `update vehicles set current_odometer = new.odometer where id = new.vehicle_id and current_odometer < new.odometer`, doar când `new.odometer is not null` (condiția se scrie explicit, nu se lasă pe seama comparației cu NULL).
- Funcția trigger-ului este `SECURITY INVOKER` (implicit), deci RLS se aplică și actualizării; are `search_path` setat explicit.
- La editarea sau ștergerea unei cheltuieli, kilometrajul mașinii **nu** scade automat. Utilizatorul îl poate corecta manual din „Mașina mea”.

De ce: câmpurile independente produc date incoerente vizibile la demo; blocarea valorilor mai mari sau mai mici blochează fie folosirea normală, fie introducerea istoricului. Trigger-ul face actualizarea atomică și independentă de client.

### D2. Confirmarea emailului

- Săptămânile 1–4: confirmarea emailului este **dezactivată** în proiectul Supabase.
- Săptămâna 5: confirmarea se activează. Linkul din email se deschide în browser, pe o pagină statică simplă („Cont confirmat, revino în aplicație”), setată ca Site URL / redirect. Utilizatorul se conectează apoi normal în aplicație.
- Deep link-ul înapoi în aplicație rămâne extensie, notată în README.

De ce: deep linking în Expo Go depinde de adresa serverului de dezvoltare și consumă timp disproporționat; limita de emailuri a serverului implicit încurcă testarea cu mai multe conturi.

### D3. RLS pentru cheltuieli

- Verificarea proprietarului se face prin vehicul (EXISTS), cu aceeași condiție în USING și WITH CHECK, plus index pe `vehicle_id`.
- Nu se adaugă coloană `user_id` pe `expenses`.

De ce: o singură sursă de adevăr pentru proprietar. Varianta cu `user_id` direct ar cere o cheie străină compusă `(vehicle_id, user_id)`, altfel un utilizator ar putea insera o cheltuială pe vehiculul altcuiva (cheile străine se verifică fără RLS). Performanța nu contează la volumul acestui proiect.

### D4. Alte decizii

- **Date din viitor:** respinse în formular (validare în aplicație). Nu se pune CHECK cu `current_date` în baza de date, pentru că rezultatul depinde de momentul evaluării.
- **Totaluri:** calculate pe client, în funcții pure din `src/lib/calc.ts`, acoperite de teste unitare. Volumul de date nu justifică un view.
- **Ștergere:** cere confirmare.
- **Formatare monetară:** valorile se afișează în RON, cu două zecimale.

### D5. Cheltuieli generale și rezumat lunar

- Modelul include acum și cheltuielile de zi cu zi: combustibil, accesorii, consumabile. Tabelul și ecranele se numesc `expenses` / „Cheltuieli”.
- Combustibilul se notează doar ca sumă. Nu se adaugă litri, preț pe litru sau consum mediu; ar muta proiectul în zona aplicațiilor dedicate (Fuelio, Drivvo) și ar depăși bugetul de timp.
- „Cheltuit luna aceasta” înseamnă luna calendaristică curentă, după data locală a telefonului.
- Calculul se face pe client, în `src/lib/calc.ts`, comparând prefixul `AAAA-LL` din șirul `performed_on` cu luna curentă. Nu se parsează `performed_on` în obiecte `Date`, ca să nu apară deplasări de fus orar.
- Rezumatul afișează doar luna curentă și totalul general; navigarea la luni anterioare e extensie.

De ce: cheltuielile mici de zi cu zi sunt cele pe care un utilizator le notează cel mai ușor, deci fac aplicația utilă și pentru cineva care nu ține încă evidența. Efort estimat: 3–5 ore, aproximativ.

---

## 8. Configurare și secrete

- Aplicația folosește doar URL-ul proiectului și **cheia publicabilă**, din variabile `EXPO_PUBLIC_*` într-un fișier `.env` necomis.
- Repository-ul conține `.env.example` cu numele variabilelor, fără valori.
- Cheile secrete (service role) și parola bazei de date nu apar niciodată în aplicație sau în repository.
- Stocarea sesiunii urmează ghidul oficial curent Expo + Supabase pentru React Native.
- Conturile de test pentru scriptul RLS sunt într-un fișier `.env.test` necomis.

---

## 9. Structura propusă a proiectului

```
src/
  app/                      # Expo Router
    (auth)/sign-in.tsx
    (auth)/sign-up.tsx
    (app)/(tabs)/index.tsx    # Rezumat
    (app)/(tabs)/history.tsx  # Istoric
    (app)/(tabs)/vehicle.tsx  # Mașina mea
    (app)/expense/new.tsx
    (app)/expense/[id].tsx    # editare + ștergere
  lib/supabase.ts           # clientul Supabase
  lib/calc.ts               # totaluri, total lunar (funcții pure)
  lib/categories.ts         # coduri + etichete RO
  components/               # componente comune
  types/database.ts         # tipuri generate din schemă
supabase/
  migrations/               # migrații SQL versionate
scripts/
  rls-check.ts              # test de acces încrucișat
docs/
  PLAN.md
```

Ecranele, componentele comune, clientul Supabase și funcțiile de calcul stau în module separate. Rutele stau în `src/app/`, convenția șablonului Expo SDK 58 (în v0.3 erau în `app/`).

---

## 10. Calitate și teste

Înainte de închiderea unei etape rulează fără erori:

- ESLint;
- verificarea TypeScript (`tsc --noEmit`);
- testele unitare.

Teste obligatorii:

- **Teste unitare** pentru `src/lib/calc.ts`:
  - total general pe un set de date cunoscut, listă goală, valori zecimale;
  - total lunar: cheltuieli în prima și în ultima zi a lunii, cheltuieli din luna precedentă și din cea următoare (se exclud), lună fără cheltuieli, trecerea dintre ani (decembrie/ianuarie).
- **Script RLS** (`scripts/rls-check.ts`): se conectează cu contul B și încearcă, direct prin API, să citească, să insereze, să modifice și să șteargă datele contului A, inclusiv inserarea unei cheltuieli pe vehiculul lui A și mutarea unei cheltuieli proprii pe vehiculul lui A. Toate încercările trebuie să eșueze sau să întoarcă zero rânduri.
- **Test pentru trigger** (în același script sau separat): o cheltuială cu kilometraj mai mare actualizează `current_odometer`; una cu kilometraj mai mic sau fără kilometraj nu îl modifică.
- **Teste manuale pe telefon:** înregistrare, conectare, deconectare, redeschiderea aplicației, lipsa conexiunii.

---

## 11. Planul pe săptămâni

Ipoteză: 4–6 ore pe săptămână (20–30 de ore în total), în paralel cu SentinelCore, munca și celelalte responsabilități. Estimarea se recalibrează după prima sesiune. Săptămânile sunt relative la începutul efectiv al lucrului.

Extinderea din v0.3 adaugă aproximativ 3–5 ore. Săptămânile 3 și 4 sunt cele mai încărcate; rezumatul lunar stă în săptămâna 4, iar filtrarea după categorie este prima care se amână dacă timpul se reduce (secțiunea 13).

| Etapă | Ce implementăm | Rezultatul verificabil |
| --- | --- | --- |
| Săptămâna 1 | Repository, proiect Expo, proiect Supabase, migrația pentru `vehicles` + RLS, client Supabase, autentificare (confirmare dezactivată). | Aplicația pornește pe telefon; înregistrarea, conectarea, sesiunea și deconectarea funcționează. |
| Săptămâna 2 | Migrația pentru `expenses` + RLS + trigger, navigarea completă, „Mașina mea”, adăugarea și listarea cheltuielilor (toate cele 6 categorii, kilometraj opțional), tipuri generate, scriptul RLS. | O cheltuială rămâne salvată după redeschiderea aplicației; kilometrajul mașinii se actualizează doar când e cazul; scriptul RLS trece. |
| Săptămâna 3 | Editare, ștergere cu confirmare, rezumat de bază (total general + ultimele 5), filtrare după categorie. | Fluxul principal poate fi demonstrat de la conectare până la actualizarea totalului. |
| Săptămâna 4 | „Cheltuit luna aceasta” + testele ei, validări, mesaje de eroare, stări de încărcare și goale, teste unitare, rezolvarea problemelor. | Totalul lunar e corect pe date cunoscute; formularele și accesul între conturi se comportă corect; testele trec. |
| Săptămâna 5 | Rezervă; activarea confirmării emailului + pagina statică; README în engleză, capturi, diagramă, date demonstrative, demonstrație. | O versiune de prezentat, cu pași de pornire și limitări explicate. |

### Prima sesiune de lucru

Creăm repository-ul și proiectul Expo, pornim aplicația pe telefon și verificăm conexiunea cu Supabase. Apoi scriem prima migrație (`vehicles` + RLS) și realizăm prima conectare. Pașii care au funcționat se notează în README.

### Înainte de prima sesiune (opțional, dar recomandat)

Strânge datele reale ale mașinii tale (facturi de service, bonuri, ce ții minte, chiar și aproximativ) într-un tabel cu aceleași coloane ca `expenses`. Le folosești ca date de demonstrație în loc de date inventate și ca test pentru regula de kilometraj.

---

## 12. Criterii de finalizare

- [ ] Înregistrarea, conectarea, deconectarea și redeschiderea aplicației au fost verificate pe telefon.
- [ ] Utilizatorul poate crea, modifica și șterge cheltuieli din toate cele 6 categorii; modificările rămân salvate online.
- [ ] Kilometrajul poate lipsi la o cheltuială; când există, actualizează kilometrajul mașinii conform D1.
- [ ] Contul B nu poate citi sau modifica datele contului A, inclusiv prin cereri directe la API (scriptul RLS trece).
- [ ] Costurile și kilometrajele negative sunt respinse de baza de date și de formular.
- [ ] „Cheltuit luna aceasta” și totalul general sunt verificate prin teste unitare pe un set de date cunoscut, inclusiv la limitele lunii.
- [ ] Lipsa conexiunii și eșecul salvării produc mesaje clare; formularul păstrează datele pentru reîncercare.
- [ ] ESLint, verificarea TypeScript și testele rulează fără erori.

## 13. Plan de rezervă

La finalul săptămânii 3 se stabilizează funcțiile principale. Dacă timpul se reduce, ordinea în care se taie este:

1. filtrarea după categorie;
2. „Cheltuit luna aceasta” (rămâne doar totalul general);
3. confirmarea emailului din săptămâna 5 (rămâne dezactivată, notat în README).

Nu se negociază: autentificarea, izolarea datelor (RLS + scriptul de verificare) și fluxul de cheltuieli.

## 14. Portofoliu

- README în engleză: descriere, capturi, diagramă de arhitectură, pași de pornire, limitări, contribuția proprie față de serviciile integrate. Aplicația se prezintă ca proiect de învățare într-un domeniu cunoscut, nu ca produs nou: există multe aplicații similare (Drivvo, Fuelio, Simply Auto ș.a.), iar valoarea proiectului e în calitatea execuției.
- Un cont demonstrativ cu date realiste (de preferat cheltuielile reale ale mașinii tale), pentru un scenariu scurt de prezentare.
- Pe planul gratuit, Supabase pune proiectele pe pauză după o perioadă de inactivitate. Proiectul trebuie reactivat înainte de orice demonstrație; README-ul menționează acest lucru.

---

## 15. Modificări în timpul implementării

Deciziile de mai jos completează sau înlocuiesc punctele indicate. Secțiunile 1–14 au rămas așa cum erau în v0.3.

### Confirmarea emailului (înlocuiește D2 pentru săptămâna 5)

- Confirmarea emailului **rămâne dezactivată**. Pagina statică nu se mai face.
- Motiv: serviciul de email implicit Supabase trimite mesaje doar adreselor membrilor echipei proiectului (pe orice plan) și are o limită mică pe oră. Cu confirmarea activă, nimeni din afara echipei nu și-ar putea crea cont, nici evaluatorul. Pentru activare ar fi nevoie de un server SMTP propriu.
- Este tăierea 3 din secțiunea 13. README-ul explică limitarea.

### Interfață și formulare

- Editarea se deschide cu tap pe rândul cheltuielii (Istoric și Rezumat); ștergerea se face doar din ecranul de editare, cu confirmare care numește descrierea, suma și data.
- „Ultimele 5” folosesc aceeași ordine ca Istoricul (data cheltuielii, apoi momentul adăugării).
- Filtrarea după categorie se face pe client, pe un rând de butoane derulabil orizontal; fără total pe categorie.
- „Cheltuit luna aceasta” este cifra principală din Rezumat, cu numele lunii dedesubt; totalul general apare sub ea.
- Limite de lungime doar în formulare: descriere 120, observații 1000, marcă și model câte 50 de caractere. Costul 0 este permis.
- Data se introduce ca text `AAAA-LL-ZZ`, precompletată cu ziua curentă; un selector de dată rămâne extensie.
- Aspectul urmează tema telefonului, deschisă sau întunecată (`userInterfaceStyle: "automatic"`), fără comutator în aplicație. Stilul „Albastru rafinat”: culorile de bază din `src/components/theme.ts`, fontul sistemului, iconiță proprie. Toate valorile de stil (culori, mărimi, spațieri, colțuri) stau în `theme.ts`.

### Teste și demonstrație

- Testele manuale de pe telefon (cont, sesiune, lipsa conexiunii, fluxul de cheltuieli) sunt în `docs/manual-tests.md`, cu un jurnal al rulărilor.
- `scripts/rls-check.ts` verifică și ramura UPDATE a trigger-ului (editarea kilometrajului).
- Datele demonstrative se încarcă cu `scripts/seed-demo.ts` din `demo-data.json` (necomis), într-un cont dedicat, cu datele de conectare în `.env.demo` (necomis). Scriptul șterge și reface cheltuielile contului la fiecare rulare.
- Deconectarea fără conexiune funcționează în cazul obișnuit; după expirarea tokenului de acces (o oră fără conexiune) cere rețea. Limitarea e notată în README.
