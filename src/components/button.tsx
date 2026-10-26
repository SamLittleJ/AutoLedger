import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/components/theme";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  isLoading?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  isLoading = false,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        (pressed || isDisabled) && styles.dimmed,
      ]}
    >
      {isLoading && (
        <ActivityIndicator color={isPrimary ? colors.primaryText : colors.primary} />
      )}
      <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    minHeight: 48,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dimmed: { opacity: 0.6 },
  text: { fontSize: 16, fontWeight: "600" },
  primaryText: { color: colors.primaryText },
  secondaryText: { color: colors.primary },
});
