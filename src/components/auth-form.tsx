import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { supabase } from "@/lib/supabase";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const { initializationError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (isSubmitting) return;
    setErrorMessage(null);
    setMessage(null);

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setErrorMessage("Introdu o adresă de email validă, care să conțină @.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Parola trebuie să aibă cel puțin 6 caractere.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setErrorMessage("Parolele nu coincid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const credentials = { email: normalizedEmail, password };
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp(credentials);
        if (error) throw error;
        if (!data.session) {
          setMessage(
            "Verifică emailul pentru confirmare, apoi conectează-te.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayedError = errorMessage ?? (message ? null : initializationError);

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text style={styles.brand}>AutoLedger</Text>
            <Text style={styles.title}>
              {isSignUp ? "Creează un cont" : "Conectează-te"}
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              accessibilityLabel="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              placeholder="nume@exemplu.ro"
              placeholderTextColor="#64748b"
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Parolă</Text>
            <TextInput
              accessibilityLabel="Parolă"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              editable={!isSubmitting}
            />

            {isSignUp && (
              <>
                <Text style={styles.label}>Confirmă parola</Text>
                <TextInput
                  accessibilityLabel="Confirmă parola"
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  editable={!isSubmitting}
                />
              </>
            )}

            {displayedError && (
              <Text accessibilityRole="alert" style={styles.error}>
                {displayedError}
              </Text>
            )}
            {message && (
              <Text accessibilityLiveRegion="polite" style={styles.message}>
                {message}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.button,
                (isSubmitting || pressed) && styles.buttonDimmed,
              ]}
            >
              {isSubmitting && <ActivityIndicator color="#ffffff" />}
              <Text style={styles.buttonText}>
                {isSubmitting
                  ? "Se trimite…"
                  : isSignUp
                    ? "Înregistrează-te"
                    : "Conectare"}
              </Text>
            </Pressable>

            <Link
              href={isSignUp ? "/(auth)/sign-in" : "/(auth)/sign-up"}
              replace
              style={styles.link}
            >
              {isSignUp
                ? "Ai deja cont? Conectează-te"
                : "Nu ai cont? Înregistrează-te"}
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  form: { width: "100%", maxWidth: 420, alignSelf: "center", gap: 12 },
  brand: { color: "#2563eb", fontSize: 18, fontWeight: "600" },
  title: { color: "#0f172a", fontSize: 28, fontWeight: "700", marginBottom: 12 },
  label: { color: "#0f172a", fontSize: 16, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  error: { color: "#b91c1c", fontSize: 16, lineHeight: 24 },
  message: { color: "#166534", fontSize: 16, lineHeight: 24 },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    minHeight: 48,
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDimmed: { opacity: 0.6 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  link: {
    color: "#1d4ed8",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 16,
    textDecorationLine: "underline",
  },
});
