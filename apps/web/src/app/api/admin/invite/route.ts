import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isProfessorEmail } from "@/lib/auth/email-rules";

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  if (!auth.isSuperAdmin) {
    return NextResponse.json(
      { error: "Solo el super administrador puede invitar administradores" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const email = (body.email as string)?.trim().toLowerCase();
  const fullName = (body.fullName as string)?.trim() ?? "";

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  if (!isProfessorEmail(email)) {
    return NextResponse.json(
      { error: "Solo correos @ipade.mx pueden ser administradores" },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseAdmin();

  const { data: existingUsers } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email,
  );

  if (existingUser) {
    const currentMeta = existingUser.user_metadata ?? {};
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      existingUser.id,
      {
        user_metadata: {
          ...currentMeta,
          role: "admin",
          approved: true,
          full_name: fullName || currentMeta.full_name,
        },
      },
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, promoted: true });
  }

  const { error: createError } = await adminClient.auth.admin.createUser({
    email,
    user_metadata: { full_name: fullName, role: "admin", approved: true },
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, created: true });
}
