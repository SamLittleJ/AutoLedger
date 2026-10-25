import { CATEGORIES, getCategoryLabel, isExpenseCategory } from "@/lib/categories";

describe("categories", () => {
  it("matches the database CHECK constraint codes", () => {
    expect(CATEGORIES.map((category) => category.code)).toEqual([
      "service",
      "repair",
      "consumables",
      "fuel",
      "accessories",
      "other",
    ]);
  });

  it("maps codes to Romanian labels", () => {
    expect(getCategoryLabel("fuel")).toBe("Combustibil");
    expect(getCategoryLabel("unknown")).toBe("unknown");
  });

  it("recognizes only known codes", () => {
    expect(isExpenseCategory("repair")).toBe(true);
    expect(isExpenseCategory("Revizie")).toBe(false);
  });
});
