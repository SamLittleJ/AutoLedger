import {
  deleteConfirmationMessage,
  expenseToFormValues,
  validateExpenseForm,
  type ExpenseFormValues,
} from "@/lib/expense-form";

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

describe("expenseToFormValues", () => {
  const stored = {
    performed_on: "2026-03-12",
    category: "service",
    description: "Schimb ulei",
    cost: 350.5,
    odometer: 152300,
    notes: "Filtre incluse",
  };

  it("formats the cost with two decimals and a decimal comma", () => {
    expect(expenseToFormValues(stored)).toEqual({
      performedOn: "2026-03-12",
      category: "service",
      description: "Schimb ulei",
      cost: "350,50",
      odometer: "152300",
      notes: "Filtre incluse",
    });
    expect(expenseToFormValues({ ...stored, cost: 7 }).cost).toBe("7,00");
    expect(expenseToFormValues({ ...stored, cost: 0.1 }).cost).toBe("0,10");
  });

  it("maps missing odometer and notes to empty fields", () => {
    const values = expenseToFormValues({ ...stored, odometer: null, notes: null });
    expect(values.odometer).toBe("");
    expect(values.notes).toBe("");
  });

  it("round-trips through validation unchanged", () => {
    const cases = [
      stored,
      { ...stored, cost: 99999999.99, odometer: 0, notes: null },
      { ...stored, category: "fuel", cost: 0, odometer: null },
    ];
    for (const expense of cases) {
      expect(validateExpenseForm(expenseToFormValues(expense), TODAY)).toEqual({
        ok: true,
        data: expense,
      });
    }
  });
});

describe("deleteConfirmationMessage", () => {
  it("names the description, cost and date", () => {
    expect(
      deleteConfirmationMessage({
        description: "Schimb ulei",
        cost: 1350,
        performed_on: "2026-03-12",
      }),
    ).toBe("„Schimb ulei”, 1.350,00 RON, 12.03.2026.\nAcțiunea nu poate fi anulată.");
  });
});
