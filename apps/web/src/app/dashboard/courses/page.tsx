import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Course {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export default async function CoursesPage() {
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from("courses")
    .select("*")
    .order("updated_at", { ascending: false });

  const courses = (data ?? []) as Course[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ipade-text">Cursos</h1>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-ipade-border bg-ipade-surface p-12 text-center">
          <p className="text-ipade-text-muted">No hay cursos creados.</p>
          <p className="mt-1 text-sm text-ipade-text-muted">
            Los cursos permiten organizar mundos de simulación y asignar participantes.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ipade-border bg-ipade-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ipade-border bg-ipade-bg">
                <th className="px-4 py-3 font-medium text-ipade-text-secondary">Nombre</th>
                <th className="px-4 py-3 font-medium text-ipade-text-secondary">Creado</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-ipade-border last:border-0 hover:bg-ipade-bg/30">
                  <td className="px-4 py-3 font-medium text-ipade-text">{course.name}</td>
                  <td className="px-4 py-3 text-ipade-text-muted">
                    {new Date(course.created_at).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="text-sm text-ipade-primary hover:underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
