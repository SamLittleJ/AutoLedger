import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";

import { colors } from "@/components/theme";

// Scrollable form container that keeps focused inputs above the keyboard.
// iOS adjusts the scroll insets natively; Android shrinks the view.
export function FormScreen({ children }: PropsWithChildren) {
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 48 },
  form: { width: "100%", maxWidth: 480, alignSelf: "center", gap: 16 },
});
