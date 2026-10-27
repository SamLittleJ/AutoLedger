import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";

import { space, useThemedStyles, type AppTheme } from "@/components/theme";

// Scrollable form container that keeps focused inputs above the keyboard.
// iOS adjusts the scroll insets natively; Android shrinks the view.
export function FormScreen({ children }: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "android" ? "height" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.form}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: space.x2l, paddingBottom: space.x3l },
    form: { width: "100%", maxWidth: 480, alignSelf: "center", gap: space.lg },
  });
