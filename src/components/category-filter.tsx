import { ScrollView, StyleSheet } from "react-native";

import { Chip } from "@/components/chip";
import { space } from "@/components/theme";
import { CATEGORIES, type ExpenseCategory } from "@/lib/categories";

type CategoryFilterProps = {
  value: ExpenseCategory | null;
  onChange: (category: ExpenseCategory | null) => void;
};

// "Toate" plus every category, always in the same order, on one scrollable row.
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel="Filtrează după categorie"
      contentContainerStyle={styles.row}
    >
      <Chip label="Toate" isSelected={value === null} onPress={() => onChange(null)} />
      {CATEGORIES.map(({ code, label }) => (
        <Chip
          key={code}
          label={label}
          isSelected={value === code}
          onPress={() => onChange(code)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.sm, paddingHorizontal: space.xl },
});
