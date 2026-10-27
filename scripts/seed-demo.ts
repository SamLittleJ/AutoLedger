// Resets the demo account to a known state for presentations (docs/PLAN.md §14).
//
// Signs in as the demo account with the publishable key only, sets its
// vehicle from the data file, deletes all its expenses and inserts the ones
// from the file. RLS limits every change to the demo account's own rows.
// Rows are validated by the database constraints; a rejected row is reported.
//
// Usage: npm run seed-demo [path/to/data.json] (reads .env.demo; see
// .env.demo.example and demo-data.example.json). Default file: demo-data.json.

import { createClient } from "@supabase/supabase-js";

import type { Database, TablesInsert } from "../src/types/database";

type DemoExpense = Omit<TablesInsert<"expenses">, "vehicle_id" | "id" | "created_at">;
type DemoData = {
  vehicle: { make: string; model: string; year: number | null; current_odometer: number };
  expenses: DemoExpense[];
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.demo.example to .env.demo and fill it in.`);
  }
  return value;
}

async function readDemoData(path: string): Promise<DemoData> {
  // Resolved against the current directory; a JSON import avoids needing
  // Node type definitions in this React Native project.
  const url = new URL(path, `file://${process.cwd()}/`).href;
  let data: DemoData;
  try {
    ({ default: data } = (await import(url, { with: { type: "json" } })) as { default: DemoData });
  } catch (error) {
    if ((error as { code?: string }).code === "ERR_MODULE_NOT_FOUND") {
      throw new Error(
        `${path} not found. Copy demo-data.example.json to ${path} and fill in the expenses.`,
      );
    }
    throw new Error(`${path} is not valid JSON: ${(error as Error).message}`);
  }
  if (!data.vehicle || !Array.isArray(data.expenses)) {
    throw new Error(`${path} needs a "vehicle" object and an "expenses" array.`);
  }
  return data;
}

async function main() {
  const dataPath = process.argv[2] ?? "demo-data.json";
  const data = await readDemoData(dataPath);

  const client = createClient<Database>(
    requireEnv("EXPO_PUBLIC_SUPABASE_URL"),
    requireEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );

  const signIn = await client.auth.signInWithPassword({
    email: requireEnv("DEMO_EMAIL"),
    password: requireEnv("DEMO_PASSWORD"),
  });
  if (signIn.error) throw new Error(`Sign-in failed: ${signIn.error.message}`);

  try {
    // Set the vehicle first, so the trigger raises its odometer from the
    // starting value as expenses are inserted.
    const existing = await client.from("vehicles").select("id").maybeSingle();
    if (existing.error) throw existing.error;
    const saved = existing.data
      ? await client.from("vehicles").update(data.vehicle).eq("id", existing.data.id).select("id").single()
      : await client.from("vehicles").insert(data.vehicle).select("id").single();
    if (saved.error) throw saved.error;
    const vehicleId = saved.data.id;

    const removed = await client.from("expenses").delete().eq("vehicle_id", vehicleId).select("id");
    if (removed.error) throw removed.error;
    console.log(`Vehicle set; removed ${removed.data.length} existing expense(s).`);

    // One row at a time, so a rejected row can be named.
    let failed = 0;
    for (const [index, expense] of data.expenses.entries()) {
      const { error } = await client.from("expenses").insert({ ...expense, vehicle_id: vehicleId });
      if (error) {
        failed += 1;
        console.error(`Row ${index + 1} ("${expense.description}") rejected: ${error.message}`);
      }
    }

    const inserted = data.expenses.length - failed;
    console.log(`Inserted ${inserted} of ${data.expenses.length} expense(s).`);
    if (failed > 0) {
      console.error("Fix the rejected rows and run the script again; it starts from scratch.");
      process.exitCode = 1;
    }
  } finally {
    await client.auth.signOut();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
