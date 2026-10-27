import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  isAuthError,
} from "@supabase/supabase-js";

import { getAuthErrorMessage } from "@/lib/auth-errors";

const NETWORK_MESSAGE =
  "Nu am putut contacta serverul. Verifică conexiunea la internet și încearcă din nou.";

// Errors from deleting the account: the password check (auth) or the
// delete-account Edge Function call.
export function getAccountDeletionErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code === "invalid_credentials") {
    return "Parola nu este corectă.";
  }
  if (error instanceof FunctionsFetchError || error instanceof TypeError) {
    return NETWORK_MESSAGE;
  }
  if (error instanceof FunctionsHttpError || error instanceof FunctionsRelayError) {
    return "Nu am putut șterge contul. Încearcă din nou în câteva momente.";
  }
  return getAuthErrorMessage(error);
}
