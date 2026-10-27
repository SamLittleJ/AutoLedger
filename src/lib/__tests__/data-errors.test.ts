import { getDataErrorMessage } from "@/lib/data-errors";

describe("getDataErrorMessage", () => {
  it("treats errors without a code as network failures", () => {
    const message = getDataErrorMessage({
      code: "",
      message: "TypeError: Network request failed",
    });
    expect(message).toMatch(/conexiunea la internet/);
  });

  it("explains a second vehicle", () => {
    expect(getDataErrorMessage({ code: "23505" })).toMatch(/deja o mașină/);
  });

  it("explains an update that matched no row", () => {
    expect(getDataErrorMessage({ code: "PGRST116" })).toMatch(/nu mai există/);
  });

  it("falls back to a generic message", () => {
    expect(getDataErrorMessage({ code: "XX000" })).toMatch(/problemă la server/);
  });
});
