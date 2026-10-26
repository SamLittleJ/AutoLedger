import { router } from "expo-router";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { ExpenseRow } from "@/components/expense-row";
import { ErrorView, LoadingView, NoVehicleView } from "@/components/state-views";
import { colors } from "@/components/theme";
import { fetchVehicleWithExpenses } from "@/lib/expenses";
import { useFocusLoad } from "@/lib/use-focus-load";

export default function HistoryScreen() {
  const { state, isRefreshing, reload } = useFocusLoad(fetchVehicleWithExpenses);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;
  if (!state.data.vehicle) return <NoVehicleView />;

  return (
    <FlatList
      style={styles.screen}
      data={state.data.expenses}
      keyExtractor={(expense) => expense.id}
      renderItem={({ item }) => <ExpenseRow expense={item} />}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={reload} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Button title="Adaugă cheltuială" onPress={() => router.push("/expense/new")} />
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          Nu ai notat încă nicio cheltuială. Adaugă prima cheltuială ca să apară aici.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16 },
  empty: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    padding: 24,
  },
});
