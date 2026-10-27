import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import {
  fontSize,
  fontWeight,
  radius,
  space,
  touchSize,
  useAppTheme,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
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
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const isPrimary = variant === "primary";
  const outlineColor = variant === "danger" ? colors.error : colors.accent;
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : [styles.outline, { borderColor: outlineColor }],
        (pressed || isDisabled) && styles.dimmed,
      ]}
    >
      {isLoading && (
        <ActivityIndicator color={isPrimary ? colors.primaryText : outlineColor} />
      )}
      <Text style={[styles.text, { color: isPrimary ? colors.primaryText : outlineColor }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    button: {
      borderRadius: radius.md,
      minHeight: touchSize.comfortable,
      padding: space.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: space.sm,
    },
    primary: { backgroundColor: colors.primary },
    outline: { backgroundColor: colors.background, borderWidth: 1 },
    dimmed: { opacity: 0.6 },
    text: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  });
