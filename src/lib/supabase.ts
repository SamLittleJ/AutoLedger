import "react-native-url-polyfill/auto";
import "expo-sqlite/localStorage/install";

import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import type { Database } from "@/types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl?.trim() || !supabasePublishableKey?.trim()) {
  throw new Error(
    "Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY before starting AutoLedger.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Browser storage is unavailable during server rendering.
    storage:
      Platform.OS !== "web" || typeof window !== "undefined"
        ? globalThis.localStorage
        : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function startAuthAutoRefresh() {
  if (Platform.OS === "web") return;

  function updateAutoRefresh(state: string | null | undefined) {
    if (state === "active") {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  }

  updateAutoRefresh(AppState.currentState);
  const subscription = AppState.addEventListener("change", updateAutoRefresh);

  return () => {
    subscription.remove();
    void supabase.auth.stopAutoRefresh();
  };
}
