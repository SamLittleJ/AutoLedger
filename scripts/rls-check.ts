// Cross-account access check for RLS and the odometer trigger (docs/PLAN.md §10).
//
// Signs in as two dedicated test accounts (A and B) with the publishable key
// only, then tries, through the REST API, to read and change A's data as B.
// Every attempt must fail or affect zero rows. Also checks that the odometer
// trigger raises current_odometer only for a higher reading.
//
// Usage: npm run rls-check (reads .env.test; see .env.test.example).
// The script writes test rows and removes them at the end. Do not point it at
// a real account.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "../src/types/database";

type Client = SupabaseClient<Database>;
type Vehicle = Tables<"vehicles">;
type Expense = Tables<"expenses">;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.test.example to .env.test and fill it in.`);
  }
  return value;
}

const url = requireEnv("EXPO_PUBLIC_SUPABASE_URL");
const publishableKey = requireEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

function newClient(): Client {
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function signIn(label: string, emailVar: string, passwordVar: string): Promise<Client> {
  const client = newClient();
  const { error } = await client.auth.signInWithPassword({
    email: requireEnv(emailVar),
    password: requireEnv(passwordVar),
  });
  if (error) throw new Error(`Sign-in failed for account ${label}: ${error.message}`);
  return client;
}

async function ensureVehicle(client: Client, label: string): Promise<Vehicle> {
  const existing = await client.from("vehicles").select("*").maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const created = await client
    .from("vehicles")
    .insert({ make: "Test", model: `RLS ${label}` })
    .select("*")
    .single();
  if (created.error) throw created.error;
  return created.data;
}

async function insertExpense(
  client: Client,
  vehicleId: string,
  odometer: number | null,
): Promise<Expense> {
  const { data, error } = await client
    .from("expenses")
    .insert({
      vehicle_id: vehicleId,
      performed_on: "2000-01-01",
      category: "other",
      description: "rls-check",
      odometer,
      cost: 1.23,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function readOdometer(client: Client, vehicleId: string): Promise<number> {
  const { data, error } = await client
    .from("vehicles")
    .select("current_odometer")
    .eq("id", vehicleId)
    .single();
  if (error) throw error;
  return data.current_odometer;
}

let failures = 0;

function report(passed: boolean, name: string, detail: string) {
  if (!passed) failures += 1;
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${passed ? "" : ` (${detail})`}`);
}

// A denied attempt either returns an error or touches zero rows.
function expectDenied(name: string, result: { data: unknown[] | null; error: unknown }) {
  const rows = result.data?.length ?? 0;
  report(result.error !== null || rows === 0, name, `${rows} row(s) returned`);
}

async function main() {
  const a = await signIn("A", "RLS_A_EMAIL", "RLS_A_PASSWORD");
  const b = await signIn("B", "RLS_B_EMAIL", "RLS_B_PASSWORD");
  const anon = newClient();

  const vehicleA = await ensureVehicle(a, "A");
  const vehicleB = await ensureVehicle(b, "B");
  if (vehicleA.user_id === vehicleB.user_id) {
    throw new Error("RLS_A_EMAIL and RLS_B_EMAIL must be two different accounts.");
  }

  const createdA: string[] = [];
  const createdB: string[] = [];
  const originalOdometer = vehicleA.current_odometer;

  try {
    const expenseA = await insertExpense(a, vehicleA.id, null);
    createdA.push(expenseA.id);
    const expenseB = await insertExpense(b, vehicleB.id, null);
    createdB.push(expenseB.id);

    console.log("\nAccount B against account A's data");

    expectDenied(
      "B cannot read A's vehicle",
      await b.from("vehicles").select("id").eq("id", vehicleA.id),
    );
    expectDenied(
      "B cannot update A's vehicle",
      await b.from("vehicles").update({ make: "Hacked" }).eq("id", vehicleA.id).select("id"),
    );
    expectDenied(
      "B cannot insert a vehicle owned by A",
      await b
        .from("vehicles")
        .insert({ user_id: vehicleA.user_id, make: "Hacked", model: "Hacked" })
        .select("id"),
    );
    expectDenied(
      "B cannot read A's expenses",
      await b.from("expenses").select("id").eq("vehicle_id", vehicleA.id),
    );

    const insertOnA = await b
      .from("expenses")
      .insert({
        vehicle_id: vehicleA.id,
        performed_on: "2000-01-01",
        category: "other",
        description: "rls-check intruder",
        cost: 1,
      })
      .select("id");
    // Should it ever succeed, A removes the row during cleanup.
    for (const row of insertOnA.data ?? []) createdA.push(row.id);
    expectDenied("B cannot insert an expense on A's vehicle", insertOnA);

    expectDenied(
      "B cannot update A's expense",
      await b.from("expenses").update({ cost: 999 }).eq("id", expenseA.id).select("id"),
    );
    expectDenied(
      "B cannot delete A's expense",
      await b.from("expenses").delete().eq("id", expenseA.id).select("id"),
    );
    expectDenied(
      "B cannot move its own expense onto A's vehicle",
      await b
        .from("expenses")
        .update({ vehicle_id: vehicleA.id })
        .eq("id", expenseB.id)
        .select("id"),
    );

    const afterA = await a.from("expenses").select("*").eq("id", expenseA.id).maybeSingle();
    report(
      afterA.data?.cost === expenseA.cost,
      "A's expense is still there and unchanged",
      afterA.error?.message ?? `found ${JSON.stringify(afterA.data)}`,
    );
    const afterVehicleA = await a.from("vehicles").select("make").eq("id", vehicleA.id).single();
    report(
      afterVehicleA.data?.make === vehicleA.make,
      "A's vehicle is unchanged",
      afterVehicleA.error?.message ?? `make is ${afterVehicleA.data?.make}`,
    );
    const afterB = await b.from("expenses").select("vehicle_id").eq("id", expenseB.id).single();
    report(
      afterB.data?.vehicle_id === vehicleB.id,
      "B's expense still belongs to B's vehicle",
      afterB.error?.message ?? `vehicle_id is ${afterB.data?.vehicle_id}`,
    );

    console.log("\nAnonymous client");

    expectDenied("anon cannot read vehicles", await anon.from("vehicles").select("id"));
    expectDenied("anon cannot read expenses", await anon.from("expenses").select("id"));

    console.log("\nOdometer trigger (account A)");

    const higher = originalOdometer + 1000;
    createdA.push((await insertExpense(a, vehicleA.id, higher)).id);
    let odometer = await readOdometer(a, vehicleA.id);
    report(odometer === higher, "a higher reading raises current_odometer", `got ${odometer}`);

    createdA.push((await insertExpense(a, vehicleA.id, higher - 500)).id);
    odometer = await readOdometer(a, vehicleA.id);
    report(odometer === higher, "a lower reading leaves it unchanged", `got ${odometer}`);

    createdA.push((await insertExpense(a, vehicleA.id, null)).id);
    odometer = await readOdometer(a, vehicleA.id);
    report(odometer === higher, "no reading leaves it unchanged", `got ${odometer}`);
  } finally {
    const cleanupErrors = [
      createdA.length > 0 && (await a.from("expenses").delete().in("id", createdA)).error,
      createdB.length > 0 && (await b.from("expenses").delete().in("id", createdB)).error,
      (
        await a
          .from("vehicles")
          .update({ current_odometer: originalOdometer })
          .eq("id", vehicleA.id)
      ).error,
    ].filter(Boolean);
    if (cleanupErrors.length > 0) {
      console.error("\nCleanup failed:", cleanupErrors);
      failures += 1;
    }
    await Promise.all([a.auth.signOut(), b.auth.signOut()]);
  }

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
