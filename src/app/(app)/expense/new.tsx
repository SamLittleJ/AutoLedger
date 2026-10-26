import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/button";
import { CategoryPicker } from "@/components/category-picker";
import { FormField } from "@/components/form-field";
import { FormScreen } from "@/components/form-screen";
import { ErrorView, LoadingView, NoVehicleView } from "@/components/state-views";
import { colors } from "@/components/theme";
import { getDataErrorMessage } from "@/lib/data-errors";
import { toLocalIsoDate } from "@/lib/dates";
import {
  validateExpenseForm,
  type ExpenseFormErrors,
  type ExpenseFormValues,
} from "@/lib/expense-form";
import { createExpense } from "@/lib/expenses";
import { useFocusLoad } from "@/lib/use-focus-load";
import { fetchVehicle } from "@/lib/vehicles";

export default function NewExpenseScreen() {
  const { state, reload } = useFocusLoad(fetchVehicle);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;
  if (!state.data) return <NoVehicleView />;

  return <ExpenseForm vehicleId={state.data.id} />;
}

function ExpenseForm({ vehicleId }: { vehicleId: string }) {
  const [values, setValues] = useState<ExpenseFormValues>(() => ({
    performedOn: toLocalIsoDate(new Date()),
    category: "",
    description: "",
    cost: "",
    odometer: "",
    notes: "",
  }));
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update(field: keyof ExpenseFormValues, text: string) {
    setValues((current) => ({ ...current, [field]: text }));
  }

  async function handleSave() {
    if (isSaving) return;
    setSaveError(null);
    const result = validateExpenseForm(values, toLocalIsoDate(new Date()));
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      await createExpense(vehicleId, result.data);
      router.back();
    } catch (error) {
      // Keep the entered values so the user can retry.
      setSaveError(getDataErrorMessage(error));
      setIsSaving(false);
    }
  }

  return (
    <FormScreen>
      <FormField
        label="Data"
        value={values.performedOn}
        onChangeText={(text) => update("performedOn", text)}
        error={errors.performedOn}
        hint="Format: AAAA-LL-ZZ"
        placeholder="AAAA-LL-ZZ"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />
      <CategoryPicker
        value={values.category}
        onChange={(code) => update("category", code)}
        error={errors.category}
      />
      <FormField
        label="Descriere"
        value={values.description}
        onChangeText={(text) => update("description", text)}
        error={errors.description}
        placeholder="ex.: Schimb ulei și filtre"
        autoCapitalize="sentences"
      />
      <FormField
        label="Cost (RON)"
        value={values.cost}
        onChangeText={(text) => update("cost", text)}
        error={errors.cost}
        placeholder="0,00"
        keyboardType="decimal-pad"
      />
      <FormField
        label="Kilometraj (opțional)"
        value={values.odometer}
        onChangeText={(text) => update("odometer", text)}
        error={errors.odometer}
        hint="Dacă e mai mare decât kilometrajul mașinii, îl actualizează."
        keyboardType="number-pad"
      />
      <FormField
        label="Observații (opțional)"
        value={values.notes}
        onChangeText={(text) => update("notes", text)}
        multiline
        style={styles.notes}
      />
      {saveError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {saveError}
        </Text>
      )}
      <Button
        title={isSaving ? "Se salvează…" : "Salvează cheltuiala"}
        onPress={handleSave}
        isLoading={isSaving}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notes: { minHeight: 96, textAlignVertical: "top" },
  error: { color: colors.error, fontSize: 16, lineHeight: 24 },
});
