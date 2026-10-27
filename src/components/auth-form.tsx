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

import {
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  space,
  touchSize,
  useAppTheme,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { supabase } from "@/lib/supabase";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const { initializationError } = useAuth();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
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
              placeholderTextColor={colors.muted}
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
              {isSubmitting && <ActivityIndicator color={colors.primaryText} />}
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

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, justifyContent: "center", padding: space.x2l },
    form: { width: "100%", maxWidth: 420, alignSelf: "center", gap: space.md },
    brand: { color: colors.primary, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
    title: {
      color: colors.text,
      fontSize: fontSize.x4l,
      fontWeight: fontWeight.bold,
      marginBottom: space.md,
    },
    label: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.medium },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      padding: space.md,
      minHeight: touchSize.comfortable,
      fontSize: fontSize.md,
      color: colors.text,
      backgroundColor: colors.background,
    },
    error: { color: colors.error, fontSize: fontSize.md, lineHeight: lineHeight.md },
    message: { color: colors.success, fontSize: fontSize.md, lineHeight: lineHeight.md },
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.sm,
      minHeight: touchSize.comfortable,
      padding: space.md,
      marginTop: space.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: space.sm,
    },
    buttonDimmed: { opacity: 0.6 },
    buttonText: {
      color: colors.primaryText,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
    link: {
      color: colors.link,
      fontSize: fontSize.md,
      textAlign: "center",
      paddingVertical: space.lg,
      textDecorationLine: "underline",
    },
  });
