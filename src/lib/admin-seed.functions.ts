import { createServerFn } from "@tanstack/react-start";

/**
 * Ensures the single, pre-configured administrator account exists.
 * Idempotent — only acts on the email defined in env (DEFAULT_ADMIN_EMAIL).
 * Safe to expose: takes no input and only enforces the configured admin.
 */
export const ensureDefaultAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!email || !password) {
    return { ok: false, reason: "not_configured" as const };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Look up the user by email (paginated list — fine for single-admin setup).
  let userId: string | null = null;
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error("listUsers failed", listErr);
    return { ok: false, reason: "list_failed" as const };
  }
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      console.error("createUser failed", createErr);
      return { ok: false, reason: "create_failed" as const };
    }
    userId = created.user.id;
  }

  if (!userId) return { ok: false, reason: "no_user" as const };

  // Ensure admin role assignment exists
  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) {
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (roleErr) {
      console.error("role insert failed", roleErr);
      return { ok: false, reason: "role_failed" as const };
    }
  }

  return { ok: true as const };
});
