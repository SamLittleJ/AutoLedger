import { router } from "expo-router";
import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { CategoryFilter } from "@/components/category-filter";
import { ExpenseRow } from "@/components/expense-row";
import { ErrorView, LoadingView, NoVehicleView } from "@/components/state-views";
import {
  fontSize,
  lineHeight,
  space,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";
import { filterByCategory } from "@/lib/calc";
import { getCategoryLabel, type ExpenseCategory } from "@/lib/categories";
import { fetchVehicleWithExpenses } from "@/lib/expenses";
import { useFocusLoad } from "@/lib/use-focus-load";

export default function HistoryScreen() {
  const { state, isRefreshing, reload } = useFocusLoad(fetchVehicleWithExpenses);
  // Kept while the tab stays mounted, including after returning from a form.
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const styles = useThemedStyles(createStyles);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;
  if (!state.data.vehicle) return <NoVehicleView />;

  const { expenses } = state.data;
  const visible = filterByCategory(expenses, category);

  return (
    <FlatList
      style={styles.screen}
      data={visible}
      keyExtractor={(expense) => expense.id}
      renderItem={({ item }) => <ExpenseRow expense={item} />}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={reload} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.padded}>
            <Button title="Adaugă cheltuială" onPress={() => router.push("/expense/new")} />
          </View>
          {expenses.length > 0 && <CategoryFilter value={category} onChange={setCategory} />}
        </View>
      }
      ListEmptyComponent={
        expenses.length === 0 ? (
          <Text style={styles.empty}>
            Nu ai notat încă nicio cheltuială. Adaugă prima cheltuială ca să apară aici.
          </Text>
        ) : (
          <View style={styles.filteredEmpty}>
            <Text style={styles.empty}>
              Nicio cheltuială în categoria {category && getCategoryLabel(category)}.
            </Text>
            <Button title="Arată toate" variant="secondary" onPress={() => setCategory(null)} />
          </View>
        )
      }
    />
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: { paddingVertical: space.lg, gap: space.md },
    padded: { paddingHorizontal: space.xl },
    filteredEmpty: { paddingHorizontal: space.x2l, paddingBottom: space.x2l },
    empty: {
      color: colors.muted,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      textAlign: "center",
      padding: space.x2l,
    },
  });
