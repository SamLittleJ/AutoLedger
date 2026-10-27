import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAppTheme, useThemedStyles, type AppTheme } from "@/components/theme";
import { AuthProvider, useAuth } from "@/lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

// Headers, the tab bar and screen transitions take their colors from here.
function useNavigationTheme(): Theme {
  const { scheme, colors } = useAppTheme();
  return useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.divider,
        notification: colors.error,
      },
    };
  }, [scheme, colors]);
}

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const navigationTheme = useNavigationTheme();
  const styles = useThemedStyles(createStyles);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" accessibilityLabel="Se încarcă sesiunea" />
      </View>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Explicit targets: "/" lives in (app), and (auth) has no index route. */}
        <Stack.Protected guard={!session} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!!session} redirectTo="/sign-in">
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });
