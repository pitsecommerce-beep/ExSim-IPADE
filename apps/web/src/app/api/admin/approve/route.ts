import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const body = await request.json();
  const userId = body.userId as string;
  const revoke = body.revoke === true;

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

  const currentMeta = userData.user.user_metadata ?? {};
  const newApproved = !revoke;

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    userId,
    { user_metadata: { ...currentMeta, approved: newApproved } },
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, approved: newApproved });
}
