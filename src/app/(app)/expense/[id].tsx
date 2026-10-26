import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { ExpenseForm } from "@/components/expense-form";
import { ErrorView, LoadingView } from "@/components/state-views";
import { colors } from "@/components/theme";
import { expenseToFormValues } from "@/lib/expense-form";
import { fetchExpense, updateExpense, type Expense } from "@/lib/expenses";
import { useFocusLoad } from "@/lib/use-focus-load";

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useCallback(() => fetchExpense(id), [id]);
  const { state, reload } = useFocusLoad(load);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;
  if (!state.data) return <NotFoundView />;

  return <EditExpenseForm expense={state.data} />;
}

function EditExpenseForm({ expense }: { expense: Expense }) {
  return (
    <ExpenseForm
      initialValues={expenseToFormValues(expense)}
      submitLabel="Salvează modificările"
      odometerHint="Dacă e mai mare decât kilometrajul mașinii, îl actualizează. Kilometrajul mașinii nu scade automat; îl poți corecta din „Mașina mea”."
      onSubmit={async (input) => {
        await updateExpense(expense.id, input);
        router.back();
      }}
    />
  );
}

// Also shown for another account's expense: RLS makes it look missing.
function NotFoundView() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Cheltuiala nu mai există</Text>
      <Text style={styles.text}>Probabil a fost ștearsă.</Text>
      <Button title="Înapoi" variant="secondary" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "700", textAlign: "center" },
  text: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: "center" },
});
