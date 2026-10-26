// Parsing of numeric form fields. Limits match the database columns:
// numeric(10,2) for costs and integer for odometer readings.

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const MAX_INTEGER = 2147483647;

export function parseCost(input: string): Parsed<number> {
  const value = input.trim().replace(",", ".");
  if (!value) return { ok: false, error: "Costul este obligatoriu." };
  if (value.startsWith("-")) {
    return { ok: false, error: "Costul nu poate fi negativ." };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return {
      ok: false,
      error: "Introdu o sumă validă, cu cel mult două zecimale (ex.: 350,50).",
    };
  }
  if (value.split(".")[0].replace(/^0+(?=\d)/, "").length > 8) {
    return { ok: false, error: "Suma este prea mare." };
  }
  return { ok: true, value: Number(value) };
}

export function parseOdometer(
  input: string,
  { optional }: { optional: boolean },
): Parsed<number | null> {
  const value = input.trim().replace(/\s/g, "");
  if (!value) {
    return optional
      ? { ok: true, value: null }
      : { ok: false, error: "Kilometrajul este obligatoriu." };
  }
  if (value.startsWith("-")) {
    return { ok: false, error: "Kilometrajul nu poate fi negativ." };
  }
  if (!/^\d+$/.test(value)) {
    return { ok: false, error: "Kilometrajul trebuie să fie un număr întreg." };
  }
  const parsed = Number(value);
  if (parsed > MAX_INTEGER) {
    return { ok: false, error: "Kilometrajul este prea mare." };
  }
  return { ok: true, value: parsed };
}
