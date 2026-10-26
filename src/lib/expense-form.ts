import { isExpenseCategory, type ExpenseCategory } from "@/lib/categories";
import { isValidIsoDate } from "@/lib/dates";
import { parseCost, parseOdometer } from "@/lib/numbers";
import type { Tables } from "@/types/database";

export type ExpenseFormValues = {
  performedOn: string;
  category: string;
  description: string;
  cost: string;
  odometer: string;
  notes: string;
};

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

export type ExpenseInput = {
  performed_on: string;
  category: ExpenseCategory;
  description: string;
  cost: number;
  odometer: number | null;
  notes: string | null;
};

export type ValidationResult<T, E> =
  | { ok: true; data: T }
  | { ok: false; errors: E };

// `today` is the local "YYYY-MM-DD" date; future dates are rejected here,
// not in the database (docs/PLAN.md D4).
export function validateExpenseForm(
  values: ExpenseFormValues,
  today: string,
): ValidationResult<ExpenseInput, ExpenseFormErrors> {
  const errors: ExpenseFormErrors = {};

  const performedOn = values.performedOn.trim();
  if (!isValidIsoDate(performedOn)) {
    errors.performedOn = "Introdu o dată validă, în formatul AAAA-LL-ZZ.";
  } else if (performedOn > today) {
    errors.performedOn = "Data nu poate fi în viitor.";
  }

  if (!isExpenseCategory(values.category)) {
    errors.category = "Alege o categorie.";
  }

  const description = values.description.trim();
  if (!description) {
    errors.description = "Descrierea este obligatorie.";
  }

  const cost = parseCost(values.cost);
  if (!cost.ok) errors.cost = cost.error;

  const odometer = parseOdometer(values.odometer, { optional: true });
  if (!odometer.ok) errors.odometer = odometer.error;

  if (Object.keys(errors).length > 0 || !cost.ok || !odometer.ok) {
    return { ok: false, errors };
  }

  const notes = values.notes.trim();
  return {
    ok: true,
    data: {
      performed_on: performedOn,
      category: values.category as ExpenseCategory,
      description,
      cost: cost.value,
      odometer: odometer.value,
      notes: notes || null,
    },
  };
}

type StoredExpense = Pick<
  Tables<"expenses">,
  "performed_on" | "category" | "description" | "cost" | "odometer" | "notes"
>;

// Inverse of validateExpenseForm, for the edit screen. The cost keeps two
// decimals and a decimal comma so it reads like what the user typed.
export function expenseToFormValues(expense: StoredExpense): ExpenseFormValues {
  return {
    performedOn: expense.performed_on,
    category: expense.category,
    description: expense.description,
    cost: expense.cost.toFixed(2).replace(".", ","),
    odometer: expense.odometer === null ? "" : String(expense.odometer),
    notes: expense.notes ?? "",
  };
}
