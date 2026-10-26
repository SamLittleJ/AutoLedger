// User-facing messages for errors returned by the Supabase data API.
// Network failures come back from postgrest-js with an empty `code`.

type DataError = { code?: string | null; message?: string | null };

export function getDataErrorMessage(error: unknown): string {
  if (error instanceof TypeError) return NETWORK_MESSAGE;

  const { code } = (error ?? {}) as DataError;
  if (!code) return NETWORK_MESSAGE;

  switch (code) {
    case "23505":
      return "Ai deja o mașină înregistrată. Reîncarcă ecranul.";
    case "23514":
    case "22P02":
    case "22003":
      return "Unele valori nu sunt valide. Verifică datele introduse.";
    case "42501":
      return "Nu ai acces la aceste date. Conectează-te din nou.";
    // Only expense updates use `.single()` on rows that can disappear.
    case "PGRST116":
      return "Cheltuiala nu mai există. Probabil a fost ștearsă.";
    case "PGRST301":
    case "PGRST303":
      return "Sesiunea a expirat. Conectează-te din nou.";
  }

  return "Nu am putut salva datele. Încearcă din nou în câteva momente.";
}

const NETWORK_MESSAGE =
  "Nu am putut contacta serverul. Verifică conexiunea la internet și încearcă din nou.";
