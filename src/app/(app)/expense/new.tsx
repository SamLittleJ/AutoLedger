import { router } from "expo-router";

import { ExpenseForm } from "@/components/expense-form";
import { ErrorView, LoadingView, NoVehicleView } from "@/components/state-views";
import { toLocalIsoDate } from "@/lib/dates";
import { createExpense } from "@/lib/expenses";
import { useFocusLoad } from "@/lib/use-focus-load";
import { fetchVehicle } from "@/lib/vehicles";

export default function NewExpenseScreen() {
  const { state, reload } = useFocusLoad(fetchVehicle);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;
  if (!state.data) return <NoVehicleView />;

  const vehicleId = state.data.id;

  return (
    <ExpenseForm
      initialValues={{
        performedOn: toLocalIsoDate(new Date()),
        category: "",
        description: "",
        cost: "",
        odometer: "",
        notes: "",
      }}
      submitLabel="Salvează cheltuiala"
      odometerHint="Dacă e mai mare decât kilometrajul mașinii, îl actualizează."
      onSubmit={async (input) => {
        await createExpense(vehicleId, input);
        router.back();
      }}
    />
  );
}
