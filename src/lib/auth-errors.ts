import { isAuthError, isAuthRetryableFetchError } from "@supabase/supabase-js";

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthRetryableFetchError(error) || error instanceof TypeError) {
    return "Nu am putut contacta serverul. Verifică conexiunea la internet și încearcă din nou.";
  }

  if (isAuthError(error)) {
    if (error.status === 429) {
      return "Prea multe încercări. Așteaptă câteva minute și încearcă din nou.";
    }

    switch (error.code) {
      case "invalid_credentials":
        return "Emailul sau parola sunt incorecte.";
      case "email_not_confirmed":
        return "Confirmă adresa de email înainte de conectare.";
      case "email_exists":
      case "user_already_exists":
        return "Există deja un cont cu această adresă de email. Conectează-te.";
      case "email_address_invalid":
      case "validation_failed":
        return "Verifică adresa de email și parola introduse.";
      case "weak_password":
        return "Parola este prea slabă. Alege o parolă mai lungă și mai greu de ghicit.";
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return "Prea multe încercări. Așteaptă câteva minute și încearcă din nou.";
      case "signup_disabled":
      case "email_provider_disabled":
        return "Înregistrarea prin email nu este disponibilă momentan.";
      case "email_address_not_authorized":
        return "Nu putem trimite un email de confirmare la această adresă momentan.";
      case "request_timeout":
        return "Serverul nu a răspuns la timp. Încearcă din nou.";
      case "session_expired":
      case "session_not_found":
      case "refresh_token_not_found":
        return "Sesiunea a expirat. Conectează-te din nou.";
    }
  }

  return "Nu am putut finaliza cererea. Încearcă din nou în câteva momente.";
}
