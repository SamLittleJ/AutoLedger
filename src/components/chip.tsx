import { Pressable, StyleSheet, Text } from "react-native";

import {
  fontSize,
  fontWeight,
  radius,
  space,
  touchSize,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";

type ChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

// One option in a radio group of pill buttons (category picker and filter).
export function Chip({ label, isSelected, onPress }: ChipProps) {
  const styles = useThemedStyles(createStyles);

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

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingHorizontal: space.md,
      paddingVertical: space.md,
      minHeight: touchSize.min,
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    text: { color: colors.text, fontSize: fontSize.chip },
    textSelected: { color: colors.primaryText, fontWeight: fontWeight.semibold },
  });
