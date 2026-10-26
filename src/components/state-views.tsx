import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { colors } from "@/components/theme";

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" accessibilityLabel="Se încarcă" />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="alert" style={styles.error}>
        {message}
      </Text>
      <Button title="Reîncearcă" onPress={onRetry} variant="secondary" />
    </View>
  );
}

export function NoVehicleView() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Nu ai adăugat încă o mașină</Text>
      <Text style={styles.text}>
        Adaugă mașina ta ca să începi să notezi cheltuielile.
      </Text>
      <Button title="Adaugă mașina" onPress={() => router.navigate("/vehicle")} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "700", textAlign: "center" },
  text: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: "center" },
  error: { color: colors.error, fontSize: 16, lineHeight: 24, textAlign: "center" },
});
