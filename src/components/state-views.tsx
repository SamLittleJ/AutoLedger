import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import {
  fontSize,
  fontWeight,
  lineHeight,
  space,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";

export function LoadingView() {
  const styles = useThemedStyles(createStateViewStyles);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" accessibilityLabel="Se încarcă" />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  const styles = useThemedStyles(createStateViewStyles);

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
  const styles = useThemedStyles(createStateViewStyles);

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

// Shared by full-screen messages elsewhere (e.g. a missing expense).
export const createStateViewStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: "center",
      padding: space.x2l,
      gap: space.lg,
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      textAlign: "center",
    },
    text: {
      color: colors.muted,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      textAlign: "center",
    },
    error: {
      color: colors.error,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      textAlign: "center",
    },
  });
