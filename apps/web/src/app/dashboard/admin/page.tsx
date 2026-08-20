import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isAdminRole, isSuperAdminEmail } from "@/lib/auth/email-rules";
import { AdminPanel } from "./admin-panel";

export default async function AdminPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role as string | undefined;
  const email = user.email ?? "";

  if (!isAdminRole(role) && !isSuperAdminEmail(email)) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ipade-text">Administracion</h1>
        <p className="mt-1 text-sm text-ipade-text-muted">
          Gestiona profesores, aprueba registros y administra permisos.
        </p>
      </div>
      <AdminPanel currentEmail={email} />
    </div>
  );
}
