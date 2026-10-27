// iOS and Android: back the global localStorage with expo-sqlite, so the
// Supabase session survives app restarts (Expo "Using Supabase" guide).
import "expo-sqlite/localStorage/install";
