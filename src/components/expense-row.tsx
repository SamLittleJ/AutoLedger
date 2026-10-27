import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  fontSize,
  fontWeight,
  space,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";
import { getCategoryLabel } from "@/lib/categories";
import { formatDisplayDate } from "@/lib/dates";
import type { Expense } from "@/lib/expenses";
import { formatKm, formatRon } from "@/lib/format";

export function ExpenseRow({ expense }: { expense: Expense }) {
  const styles = useThemedStyles(createStyles);
  const details = [formatDisplayDate(expense.performed_on), getCategoryLabel(expense.category)];
  if (expense.odometer !== null) details.push(formatKm(expense.odometer));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Deschide cheltuiala pentru editare"
      onPress={() => router.push({ pathname: "/expense/[id]", params: { id: expense.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.main}>
        <Text style={styles.description} numberOfLines={2}>
          {expense.description}
        </Text>
        <Text style={styles.details}>{details.join(" · ")}</Text>
        {expense.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {expense.notes}
          </Text>
        )}
      </View>
      <Text style={styles.cost}>{formatRon(expense.cost)}</Text>
    </Pressable>
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: space.md,
      paddingVertical: space.md,
      paddingHorizontal: space.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.background,
    },
    pressed: { backgroundColor: colors.surface },
    main: { flex: 1, gap: space.xs },
    description: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
    details: { color: colors.muted, fontSize: fontSize.sm },
    notes: { color: colors.muted, fontSize: fontSize.sm, fontStyle: "italic" },
    cost: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  });
