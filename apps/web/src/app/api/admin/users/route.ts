import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const adminClient = createSupabaseAdmin();

  const allUsers: Array<{
    id: string;
    email: string;
    full_name: string;
    role: string;
    approved: boolean;
    created_at: string;
  }> = [];

  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const u of data.users) {
      const role = (u.user_metadata?.role as string) ?? "unknown";
      if (role === "participant") continue;

      allUsers.push({
        id: u.id,
        email: u.email ?? "",
        full_name: (u.user_metadata?.full_name as string) ?? "",
        role,
        approved: u.user_metadata?.approved === true,
        created_at: u.created_at,
      });
    }

    if (data.users.length < perPage) break;
    page++;
  }

  const pendingProfessors = allUsers.filter(
    (u) => u.role === "professor" && !u.approved,
  );
  const approvedProfessors = allUsers.filter(
    (u) => u.role === "professor" && u.approved,
  );
  const admins = allUsers.filter((u) => u.role === "admin");

  return NextResponse.json({
    pendingProfessors,
    approvedProfessors,
    admins,
  });
}
