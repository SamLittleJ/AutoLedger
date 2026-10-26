import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/theme";
import { CATEGORIES } from "@/lib/categories";

type CategoryPickerProps = {
  value: string;
  onChange: (code: string) => void;
  error?: string;
};

export function CategoryPicker({ value, onChange, error }: CategoryPickerProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Categorie</Text>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {CATEGORIES.map(({ code, label }) => {
          const isSelected = value === code;
          return (
            <Pressable
              key={code}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              onPress={() => onChange(code)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 15 },
  chipTextSelected: { color: colors.primaryText, fontWeight: "600" },
  error: { color: colors.error, fontSize: 14, lineHeight: 20 },
});
