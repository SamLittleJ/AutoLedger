import { StyleSheet, Text, View } from "react-native";

import { Chip } from "@/components/chip";
import {
  fontSize,
  fontWeight,
  lineHeight,
  space,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";
import { CATEGORIES } from "@/lib/categories";

type CategoryPickerProps = {
  value: string;
  onChange: (code: string) => void;
  error?: string;
};

export function CategoryPicker({ value, onChange, error }: CategoryPickerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Categorie</Text>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {CATEGORIES.map(({ code, label }) => (
          <Chip
            key={code}
            label={label}
            isSelected={value === code}
            onPress={() => onChange(code)}
          />
        ))}
      </View>
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
    options: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
    error: { color: colors.error, fontSize: fontSize.sm, lineHeight: lineHeight.sm },
  });
