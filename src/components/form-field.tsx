import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

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

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export function FormField({ label, hint, error, style, ...inputProps }: FormFieldProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    field: { gap: space.sm },
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
    inputError: { borderColor: colors.error },
    hint: { color: colors.muted, fontSize: fontSize.sm, lineHeight: lineHeight.sm },
    error: { color: colors.error, fontSize: fontSize.sm, lineHeight: lineHeight.sm },
  });
