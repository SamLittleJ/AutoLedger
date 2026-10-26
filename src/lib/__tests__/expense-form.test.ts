import { validateExpenseForm, type ExpenseFormValues } from "@/lib/expense-form";

const TODAY = "2026-10-25";

const valid: ExpenseFormValues = {
  performedOn: "2026-10-20",
  category: "fuel",
  description: " Plin ",
  cost: "350,50",
  odometer: "",
  notes: "  ",
};

describe("validateExpenseForm", () => {
  it("accepts a fuel expense without odometer and trims text", () => {
    expect(validateExpenseForm(valid, TODAY)).toEqual({
      ok: true,
      data: {
        performed_on: "2026-10-20",
        category: "fuel",
        description: "Plin",
        cost: 350.5,
        odometer: null,
        notes: null,
      },
    });
  });

  it("accepts today and an odometer reading", () => {
    const result = validateExpenseForm(
      { ...valid, performedOn: TODAY, odometer: "123 456" },
      TODAY,
    );
    expect(result.ok && result.data.odometer).toBe(123456);
  });

  it("rejects future dates", () => {
    const result = validateExpenseForm({ ...valid, performedOn: "2026-10-26" }, TODAY);
    expect(result).toEqual({
      ok: false,
      errors: { performedOn: "Data nu poate fi în viitor." },
    });
  });

  it("reports every invalid field", () => {
    const result = validateExpenseForm(
      {
        performedOn: "2026-02-30",
        category: "Revizie",
        description: "   ",
        cost: "-10",
        odometer: "12.5",
        notes: "",
      },
      TODAY,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ["category", "cost", "description", "odometer", "performedOn"].sort(),
      );
    }
  });
});
