import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { ErrorView, LoadingView, NoVehicleView } from "@/components/state-views";
import { colors } from "@/components/theme";
import { formatKm } from "@/lib/format";
import { useFocusLoad } from "@/lib/use-focus-load";
import { fetchVehicle } from "@/lib/vehicles";

export default function SummaryScreen() {
  const { state, reload } = useFocusLoad(fetchVehicle);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;

  const vehicle = state.data;
  if (!vehicle) return <NoVehicleView />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.vehicleName}>
          {vehicle.make} {vehicle.model}
          {vehicle.year !== null && ` (${vehicle.year})`}
        </Text>
        <Text style={styles.odometer}>{formatKm(vehicle.current_odometer)}</Text>
      </View>
      <Button title="Adaugă cheltuială" onPress={() => router.push("/expense/new")} />
      <Button
        title="Vezi istoricul"
        variant="secondary"
        onPress={() => router.navigate("/history")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 20,
    gap: 4,
  },
  vehicleName: { color: colors.text, fontSize: 22, fontWeight: "700" },
  odometer: { color: colors.muted, fontSize: 16 },
});
