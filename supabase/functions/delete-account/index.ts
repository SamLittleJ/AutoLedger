// Deletes the calling user's account. Their vehicle and expenses are removed
// by ON DELETE CASCADE (auth.users -> vehicles -> expenses).
//
// withSupabase({ auth: "user" }) rejects requests without a valid user JWT,
// so a caller can only ever delete their own account; the function takes no
// input. supabaseAdmin uses the project's secret key, which never leaves the
// Supabase environment.
import { withSupabase } from "npm:@supabase/server@1";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "method_not_allowed" }, { status: 405 });
    }

    const userId = ctx.userClaims?.id;
    if (!userId) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("deleteUser failed", error.message);
      return Response.json({ error: "delete_failed" }, { status: 500 });
    }

    return Response.json({ deleted: true });
  }),
};
