import { createAdminClient } from "@/lib/supabase/admin";

export async function miniAccountLinked(userId: string) {
  const { data, error } = await createAdminClient().auth.admin.getUserById(userId);
  if (error || !data.user) throw new Error("MINI_ACCOUNT_UNAVAILABLE");
  return Boolean(data.user.phone || (data.user.email && !data.user.email.endsWith("@mini.lingxifield.invalid")));
}
