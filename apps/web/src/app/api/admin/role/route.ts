import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isSuperAdminEmail } from "@/lib/auth/email-rules";

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  if (!auth.isSuperAdmin) {
    return NextResponse.json(
      { error: "Solo el super administrador puede cambiar roles" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const userId = body.userId as string;
  const newRole = body.role as string;

  if (!userId || !newRole) {
    return NextResponse.json(
      { error: "userId y role requeridos" },
      { status: 400 },
    );
  }

  if (!["admin", "professor"].includes(newRole)) {
    return NextResponse.json(
      { error: "Role debe ser 'admin' o 'professor'" },
      { status: 400 },
    );
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
      { error: "No se puede cambiar el rol del super administrador" },
      { status: 403 },
    );
  }

  const currentMeta = userData.user.user_metadata ?? {};

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...currentMeta,
        role: newRole,
        approved: newRole === "admin" ? true : currentMeta.approved,
      },
    },
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
