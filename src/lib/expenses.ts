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

// Null when the expense does not exist or belongs to another account (RLS).
export async function fetchExpense(id: string): Promise<Expense | null> {
  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createExpense(vehicleId: string, input: ExpenseInput): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .insert({ ...input, vehicle_id: vehicleId });
  if (error) throw error;
}

// vehicle_id is not part of the input: an expense never changes vehicle.
// `.single()` fails with PGRST116 when no row matched (deleted meanwhile).
export async function updateExpense(id: string, input: ExpenseInput): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .update(input)
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
}

// Deleting a row that is already gone is not an error: the outcome is the same.
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
