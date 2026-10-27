import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { ExpenseForm } from "@/components/expense-form";
import { createStateViewStyles, ErrorView, LoadingView } from "@/components/state-views";
import {
  fontSize,
  lineHeight,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";
import { getDataErrorMessage } from "@/lib/data-errors";
import { deleteConfirmationMessage, expenseToFormValues } from "@/lib/expense-form";
import { deleteExpense, fetchExpense, updateExpense, type Expense } from "@/lib/expenses";
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
  const styles = useThemedStyles(createStyles);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function performDelete() {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      router.back();
    } catch (error) {
      setDeleteError(getDataErrorMessage(error));
      setIsDeleting(false);
    }
  }

  function confirmDelete() {
    if (isDeleting) return;
    Alert.alert("Ștergi cheltuiala?", deleteConfirmationMessage(expense), [
      { text: "Anulează", style: "cancel" },
      { text: "Șterge", style: "destructive", onPress: performDelete },
    ]);
  }

  return (
    <ExpenseForm
      initialValues={expenseToFormValues(expense)}
      submitLabel="Salvează modificările"
      odometerHint="Dacă e mai mare decât kilometrajul mașinii, îl actualizează. Kilometrajul mașinii nu scade automat; îl poți corecta din „Mașina mea”."
      onSubmit={async (input) => {
        await updateExpense(expense.id, input);
        router.back();
      }}
      footer={
        <>
          {deleteError && (
            <Text accessibilityRole="alert" style={styles.error}>
              {deleteError}
            </Text>
          )}
          <Button
            title={isDeleting ? "Se șterge…" : "Șterge cheltuiala"}
            variant="danger"
            onPress={confirmDelete}
            isLoading={isDeleting}
          />
        </>
      }
    />
  );
}

// Also shown for another account's expense: RLS makes it look missing.
function NotFoundView() {
  const styles = useThemedStyles(createStateViewStyles);

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Cheltuiala nu mai există</Text>
      <Text style={styles.text}>Probabil a fost ștearsă.</Text>
      <Button title="Înapoi" variant="secondary" onPress={() => router.back()} />
    </View>
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    error: { color: colors.error, fontSize: fontSize.md, lineHeight: lineHeight.md },
  });
