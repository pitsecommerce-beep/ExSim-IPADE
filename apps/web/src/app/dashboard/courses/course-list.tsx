"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Course {
  id: string;
  name: string;
  created_at: string;
}

export function CourseList({ courses }: { courses: Course[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const supabase = getSupabase();
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      alert(`Error al eliminar: ${error.message}`);
    }
    setDeleting(null);
    setConfirmId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="group relative rounded-lg border border-ipade-border bg-ipade-surface p-5 transition-shadow hover:shadow-md"
        >
          <Link
            href={`/dashboard/courses/${course.id}`}
            className="block"
          >
            <h3 className="font-semibold text-ipade-text group-hover:text-ipade-primary pr-8">
              {course.name}
            </h3>
            <p className="mt-2 text-xs text-ipade-text-muted">
              Creado{" "}
              {new Date(course.created_at).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </Link>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmId(course.id);
            }}
            className="absolute right-3 top-3 rounded p-1 text-ipade-text-muted opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            title="Eliminar curso"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>

          {confirmId === course.id && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-ipade-surface/95 p-4 backdrop-blur-sm">
              <p className="text-center text-sm font-medium text-ipade-text">
                Eliminar &quot;{course.name}&quot;?
              </p>
              <p className="text-center text-xs text-ipade-text-muted">
                Se eliminarán todos los mundos, equipos y datos asociados.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmId(null)}
                  className="rounded-md border border-ipade-border px-3 py-1.5 text-xs font-medium text-ipade-text hover:bg-ipade-bg"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  disabled={deleting === course.id}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting === course.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
