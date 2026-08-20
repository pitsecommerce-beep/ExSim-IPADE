import { createSupabaseServer } from "@/lib/supabase/server";
import { isAdminRole, isSuperAdminEmail } from "./email-rules";

export async function verifyAdmin(): Promise<{
  authorized: boolean;
  userId?: string;
  email?: string;
  isSuperAdmin?: boolean;
  error?: string;
}> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "No autenticado" };
  }

  const role = user.user_metadata?.role as string | undefined;
  const email = user.email ?? "";

  if (!isAdminRole(role) && !isSuperAdminEmail(email)) {
    return { authorized: false, error: "No autorizado" };
  }

  return {
    authorized: true,
    userId: user.id,
    email,
    isSuperAdmin: isSuperAdminEmail(email),
  };
}
