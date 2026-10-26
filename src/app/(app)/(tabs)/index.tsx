import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { ExpenseRow } from "@/components/expense-row";
import { ErrorView, LoadingView, NoVehicleView } from "@/components/state-views";
import { colors } from "@/components/theme";
import { latestExpenses, totalCost } from "@/lib/calc";
import { fetchVehicleWithExpenses } from "@/lib/expenses";
import { formatKm, formatRon } from "@/lib/format";
import { useFocusLoad } from "@/lib/use-focus-load";

const LATEST_COUNT = 5;

export default function SummaryScreen() {
  const { state, isRefreshing, reload } = useFocusLoad(fetchVehicleWithExpenses);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;

  const { vehicle, expenses } = state.data;
  if (!vehicle) return <NoVehicleView />;

  const latest = latestExpenses(expenses, LATEST_COUNT);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={reload} />}
    >
      <View style={styles.padded}>
        <View style={styles.card}>
          <Text style={styles.vehicleName}>
            {vehicle.make} {vehicle.model}
            {vehicle.year !== null && ` (${vehicle.year})`}
          </Text>
          <Text style={styles.muted}>{formatKm(vehicle.current_odometer)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.muted}>Total cheltuit</Text>
          <Text style={styles.total}>{formatRon(totalCost(expenses))}</Text>
        </View>
        <Button title="Adaugă cheltuială" onPress={() => router.push("/expense/new")} />
      </View>

      <Text style={[styles.sectionTitle, styles.padded]}>Ultimele cheltuieli</Text>
      {latest.length === 0 ? (
        <Text style={[styles.empty, styles.padded]}>
          Nu ai notat încă nicio cheltuială. Adaugă prima cheltuială ca să apară aici.
        </Text>
      ) : (
        <View>
          {latest.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}
          <View style={styles.padded}>
            <Button
              title="Vezi tot istoricul"
              variant="secondary"
              onPress={() => router.navigate("/history")}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingVertical: 24, gap: 16 },
  padded: { paddingHorizontal: 24, gap: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 20,
    gap: 4,
  },
  vehicleName: { color: colors.text, fontSize: 22, fontWeight: "700" },
  muted: { color: colors.muted, fontSize: 16 },
  total: { color: colors.text, fontSize: 28, fontWeight: "700" },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  empty: { color: colors.muted, fontSize: 16, lineHeight: 24 },
});
