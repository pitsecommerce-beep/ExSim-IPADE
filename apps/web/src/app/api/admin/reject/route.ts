import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isSuperAdminEmail } from "@/lib/auth/email-rules";

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const body = await request.json();
  const userId = body.userId as string;

  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  const adminClient = createSupabaseAdmin();

  const { data: userData, error: getUserError } =
    await adminClient.auth.admin.getUserById(userId);

  if (getUserError || !userData.user) {
    return NextResponse.json(
      { error: getUserError?.message ?? "Usuario no encontrado" },
      { status: 404 },
    );
  }

  if (isSuperAdminEmail(userData.user.email ?? "")) {
    return NextResponse.json(
      { error: "No se puede eliminar al super administrador" },
      { status: 403 },
    );
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
