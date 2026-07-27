import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { CourseList } from "./course-list";

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
        <div>
          <h1 className="text-2xl font-bold text-ipade-text">Cursos</h1>
          <p className="mt-1 text-sm text-ipade-text-secondary">
            Administra tus cursos de simulación y participantes.
          </p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className="rounded-md bg-ipade-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover"
        >
          Nuevo Curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-ipade-border bg-ipade-surface p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-ipade-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="mt-4 text-ipade-text-muted">No hay cursos creados.</p>
          <p className="mt-1 text-sm text-ipade-text-muted">
            Crea tu primer curso para organizar simulaciones y asignar participantes.
          </p>
          <Link
            href="/dashboard/courses/new"
            className="mt-4 inline-block rounded-md bg-ipade-accent px-4 py-2 text-sm font-medium text-white hover:bg-ipade-accent-hover"
          >
            Crear Primer Curso
          </Link>
        </div>
      ) : (
        <CourseList courses={courses} />
      )}
    </div>
  );
}
