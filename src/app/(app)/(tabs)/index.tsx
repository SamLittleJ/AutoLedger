import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { ExpenseRow } from "@/components/expense-row";
import { ErrorView, LoadingView, NoVehicleView } from "@/components/state-views";
import {
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  space,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";
import { latestExpenses, monthlyTotal, totalCost } from "@/lib/calc";
import { currentMonthKey, formatMonth } from "@/lib/dates";
import { fetchVehicleWithExpenses } from "@/lib/expenses";
import { formatKm, formatRon } from "@/lib/format";
import { useFocusLoad } from "@/lib/use-focus-load";

const LATEST_COUNT = 5;

export default function SummaryScreen() {
  const { state, isRefreshing, reload } = useFocusLoad(fetchVehicleWithExpenses);
  const styles = useThemedStyles(createStyles);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;

  const { vehicle, expenses } = state.data;
  if (!vehicle) return <NoVehicleView />;

  const latest = latestExpenses(expenses, LATEST_COUNT);
  // Recomputed on every render, so a reload after midnight picks the new month.
  const month = currentMonthKey(new Date());

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={reload} />}
    >
      <View style={styles.padded}>
        <View style={styles.vehicle}>
          <Text style={styles.vehicleName}>
            {vehicle.make} {vehicle.model}
            {vehicle.year !== null && ` (${vehicle.year})`}
          </Text>
          <Text style={styles.muted}>{formatKm(vehicle.current_odometer)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.muted}>Cheltuit luna aceasta</Text>
          <Text style={styles.total}>{formatRon(monthlyTotal(expenses, month))}</Text>
          <Text style={styles.muted}>{formatMonth(month)}</Text>
          <View style={styles.divider} />
          <View style={styles.overallRow}>
            <Text style={styles.muted}>Total cheltuit</Text>
            <Text style={styles.overall}>{formatRon(totalCost(expenses))}</Text>
          </View>
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

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingVertical: space.x2l, gap: space.lg },
    padded: { paddingHorizontal: space.xl, gap: space.lg },
    vehicle: { gap: space.xs },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: space.xl,
      gap: space.xs,
    },
    vehicleName: { color: colors.text, fontSize: fontSize.x2l, fontWeight: fontWeight.bold },
    muted: { color: colors.muted, fontSize: fontSize.md },
    total: {
      color: colors.text,
      fontSize: fontSize.display,
      fontWeight: fontWeight.bold,
      fontVariant: ["tabular-nums"],
    },
    overallRow: { flexDirection: "row", justifyContent: "space-between", gap: space.md },
    overall: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      fontVariant: ["tabular-nums"],
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginVertical: space.sm,
    },
    sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
    empty: { color: colors.muted, fontSize: fontSize.md, lineHeight: lineHeight.md },
  });
