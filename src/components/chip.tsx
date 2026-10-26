import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/components/theme";

type ChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

// One option in a radio group of pill buttons (category picker and filter).
export function Chip({ label, isSelected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipSelected]}
    >
      <Text style={[styles.text, isSelected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontSize: 15 },
  textSelected: { color: colors.primaryText, fontWeight: "600" },
});
