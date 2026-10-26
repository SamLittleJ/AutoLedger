import type { ExpenseInput } from "@/lib/expense-form";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

export type Expense = Tables<"expenses">;

// Ordering from docs/PLAN.md §5: newest date first, then newest entry.
export async function fetchExpenses(vehicleId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("performed_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createExpense(vehicleId: string, input: ExpenseInput): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .insert({ ...input, vehicle_id: vehicleId });
  if (error) throw error;
}
