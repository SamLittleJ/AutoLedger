import {
  AuthApiError,
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

import { getAccountDeletionErrorMessage } from "@/lib/account-errors";

describe("getAccountDeletionErrorMessage", () => {
  it("names a wrong password", () => {
    const error = new AuthApiError("Invalid login credentials", 400, "invalid_credentials");
    expect(getAccountDeletionErrorMessage(error)).toBe("Parola nu este corectă.");
  });

  it("treats a failed function request as a network problem", () => {
    expect(getAccountDeletionErrorMessage(new FunctionsFetchError({}))).toMatch(
      /conexiunea la internet/,
    );
    expect(getAccountDeletionErrorMessage(new TypeError("Network request failed"))).toMatch(
      /conexiunea la internet/,
    );
  });

  it("explains a function that answered with an error", () => {
    const response = new Response(null, { status: 500 });
    expect(getAccountDeletionErrorMessage(new FunctionsHttpError(response))).toMatch(
      /Nu am putut șterge contul/,
    );
    expect(getAccountDeletionErrorMessage(new FunctionsRelayError({}))).toMatch(
      /Nu am putut șterge contul/,
    );
  });

  it("falls back to the auth messages", () => {
    const error = new AuthApiError("Too many requests", 429, "over_request_rate_limit");
    expect(getAccountDeletionErrorMessage(error)).toMatch(/Prea multe încercări/);
  });
});
