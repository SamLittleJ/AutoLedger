import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignOut() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>AutoLedger</Text>
          <Text style={styles.text}>Conectat ca {session?.user.email}</Text>
          {errorMessage && (
            <Text accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </Text>
          )}
          <Button
            title={isSubmitting ? "Se deconectează…" : "Deconectare"}
            onPress={handleSignOut}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 420, alignSelf: "center", gap: 24 },
  title: { color: "#0f172a", fontSize: 28, fontWeight: "700" },
  text: { color: "#0f172a", fontSize: 18 },
  error: { color: "#b91c1c", fontSize: 16, lineHeight: 24 },
});
