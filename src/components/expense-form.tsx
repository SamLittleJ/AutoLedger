import { useState, type ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/button";
import { CategoryPicker } from "@/components/category-picker";
import { FormField } from "@/components/form-field";
import { FormScreen } from "@/components/form-screen";
import { colors } from "@/components/theme";
import { getDataErrorMessage } from "@/lib/data-errors";
import { toLocalIsoDate } from "@/lib/dates";
import {
  validateExpenseForm,
  type ExpenseFormErrors,
  type ExpenseFormValues,
  type ExpenseInput,
} from "@/lib/expense-form";

type ExpenseFormProps = {
  initialValues: ExpenseFormValues;
  submitLabel: string;
  odometerHint: string;
  // Resolves after saving (the screen navigates away); throws to show an error.
  onSubmit: (input: ExpenseInput) => Promise<void>;
  // Extra actions under the save button, such as delete on the edit screen.
  footer?: ReactNode;
};

// Shared by the new and edit screens.
export function ExpenseForm({
  initialValues,
  submitLabel,
  odometerHint,
  onSubmit,
  footer,
}: ExpenseFormProps) {
  const [values, setValues] = useState(initialValues);
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
      await onSubmit(result.data);
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
        maxLength={120}
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
        hint={odometerHint}
        keyboardType="number-pad"
      />
      <FormField
        label="Observații (opțional)"
        value={values.notes}
        onChangeText={(text) => update("notes", text)}
        maxLength={1000}
        multiline
        style={styles.notes}
      />
      {saveError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {saveError}
        </Text>
      )}
      <Button
        title={isSaving ? "Se salvează…" : submitLabel}
        onPress={handleSave}
        isLoading={isSaving}
      />
      {footer}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notes: { minHeight: 96, textAlignVertical: "top" },
  error: { color: colors.error, fontSize: 16, lineHeight: 24 },
});
