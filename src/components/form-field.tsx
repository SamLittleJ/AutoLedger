import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { colors } from "@/components/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export function FormField({ label, hint, error, style, ...inputProps }: FormFieldProps) {
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

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: colors.text, fontSize: 16, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.error },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.error, fontSize: 14, lineHeight: 20 },
});
