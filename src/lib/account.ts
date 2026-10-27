import { setSignedOutNotice } from "@/lib/signed-out-notice";
import { supabase } from "@/lib/supabase";

// Checks the password, then asks the delete-account Edge Function to delete
// the signed-in user. The vehicle and expenses go with it (ON DELETE CASCADE).
// The app cannot delete users itself: that needs the secret key, which only
// the function holds.
export async function deleteAccount(email: string, password: string): Promise<void> {
  const check = await supabase.auth.signInWithPassword({ email, password });
  if (check.error) throw check.error;

  const { error } = await supabase.functions.invoke("delete-account", { method: "POST" });
  if (error) throw error;

  setSignedOutNotice("Contul și datele tale au fost șterse.");
  // The server session is gone with the user; only clear the local one.
  await supabase.auth.signOut({ scope: "local" });
}
