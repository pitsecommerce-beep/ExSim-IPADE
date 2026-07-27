import { createSupabaseServer } from "@/lib/supabase/server";
import { CourseForm } from "./course-form";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const supabase = await createSupabaseServer();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name")
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ipade-text">Nuevo Curso</h1>
        <p className="mt-1 text-sm text-ipade-text-secondary">
          Configura los detalles del curso y asigna participantes.
        </p>
      </div>

      <CourseForm profiles={(profiles ?? []) as { id: string; name: string }[]} />
    </div>
  );
}
