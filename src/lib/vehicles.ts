import { supabase } from "@/lib/supabase";
import type { VehicleInput } from "@/lib/vehicle-form";
import type { Tables } from "@/types/database";

export type Vehicle = Tables<"vehicles">;

// RLS returns only the signed-in user's vehicle; there is at most one.
export async function fetchVehicle(): Promise<Vehicle | null> {
  const { data, error } = await supabase.from("vehicles").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveVehicle(
  vehicleId: string | null,
  input: VehicleInput,
): Promise<Vehicle> {
  const query = vehicleId
    ? supabase.from("vehicles").update(input).eq("id", vehicleId)
    : supabase.from("vehicles").insert(input);
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data;
}
