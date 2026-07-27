import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CourseDetail } from "./course-detail";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !course) {
    redirect("/dashboard/courses");
  }

  const { data: worlds } = await supabase
    .from("worlds")
    .select("*, teams(*, team_members(*))")
    .eq("course_id", id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("id", (course as Record<string, unknown>).profile_id)
    .maybeSingle();

  return (
    <CourseDetail
      course={course as Record<string, unknown>}
      worlds={(worlds ?? []) as Record<string, unknown>[]}
      profile={profile as { id: string; name: string } | null}
    />
  );
}
