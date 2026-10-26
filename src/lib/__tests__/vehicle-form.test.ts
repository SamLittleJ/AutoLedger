import { validateVehicleForm } from "@/lib/vehicle-form";

describe("validateVehicleForm", () => {
  it("accepts a vehicle without a year", () => {
    expect(
      validateVehicleForm({ make: " Dacia ", model: "Logan", year: "", currentOdometer: "152300" }),
    ).toEqual({
      ok: true,
      data: { make: "Dacia", model: "Logan", year: null, current_odometer: 152300 },
    });
  });

  it("rejects empty names, an out-of-range year and a negative odometer", () => {
    const result = validateVehicleForm({
      make: " ",
      model: "",
      year: "1899",
      currentOdometer: "-1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ["currentOdometer", "make", "model", "year"].sort(),
      );
    }
  });

  it("rejects a non-numeric year", () => {
    const result = validateVehicleForm({
      make: "VW",
      model: "Golf",
      year: "20a6",
      currentOdometer: "0",
    });
    expect(result.ok).toBe(false);
  });
});
