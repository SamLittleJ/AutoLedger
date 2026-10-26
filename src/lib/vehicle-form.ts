import type { ValidationResult } from "@/lib/expense-form";
import { parseOdometer } from "@/lib/numbers";

export type VehicleFormValues = {
  make: string;
  model: string;
  year: string;
  currentOdometer: string;
};

export type VehicleFormErrors = Partial<Record<keyof VehicleFormValues, string>>;

export type VehicleInput = {
  make: string;
  model: string;
  year: number | null;
  current_odometer: number;
};

export function validateVehicleForm(
  values: VehicleFormValues,
): ValidationResult<VehicleInput, VehicleFormErrors> {
  const errors: VehicleFormErrors = {};

  const make = values.make.trim();
  if (!make) errors.make = "Marca este obligatorie.";

  const model = values.model.trim();
  if (!model) errors.model = "Modelul este obligatoriu.";

  const yearText = values.year.trim();
  let year: number | null = null;
  if (yearText) {
    year = /^\d{4}$/.test(yearText) ? Number(yearText) : NaN;
    if (!(year >= 1900 && year <= 2100)) {
      errors.year = "Anul trebuie să fie între 1900 și 2100.";
    }
  }

  const odometer = parseOdometer(values.currentOdometer, { optional: false });
  if (!odometer.ok) errors.currentOdometer = odometer.error;

  if (Object.keys(errors).length > 0 || !odometer.ok || odometer.value === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { make, model, year, current_odometer: odometer.value },
  };
}
