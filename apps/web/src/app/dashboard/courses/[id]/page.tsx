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
    .select("*, teams(id, name, team_members(id, user_id))")
    .eq("course_id", id);

  const firstWorld = (worlds ?? [])[0] as Record<string, unknown> | undefined;
  const profileId = firstWorld?.profile_id as string | undefined;

  const { data: profile } = profileId
    ? await supabase.from("profiles").select("id, name").eq("id", profileId).maybeSingle()
    : { data: null };

  return (
    <CourseDetail
      course={course as Record<string, unknown>}
      worlds={(worlds ?? []) as Record<string, unknown>[]}
      profile={profile as { id: string; name: string } | null}
    />
  );
}
