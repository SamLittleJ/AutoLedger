import { StyleSheet, Text, View } from "react-native";

import { Chip } from "@/components/chip";
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

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: colors.text, fontSize: 16, fontWeight: "500" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  error: { color: colors.error, fontSize: 14, lineHeight: 20 },
});
