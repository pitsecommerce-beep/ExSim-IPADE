import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ProfileActions } from "./profile-actions";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const supabase = await createSupabaseServer();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, created_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ipade-text">Perfiles</h1>
          <p className="mt-1 text-sm text-ipade-text-secondary">
            Configura los parámetros de simulación para tus cursos.
          </p>
        </div>
        <ProfileActions />
      </div>

      <div className="mt-6">
        {!profiles || profiles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ipade-border bg-ipade-surface p-12 text-center">
            <p className="text-ipade-text-muted">No hay perfiles creados.</p>
            <p className="mt-1 text-sm text-ipade-text-muted">
              Crea tu primer perfil para comenzar a configurar simulaciones.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-ipade-border bg-ipade-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ipade-border bg-ipade-bg">
                  <th className="px-4 py-3 font-medium text-ipade-text-secondary">Nombre</th>
                  <th className="px-4 py-3 font-medium text-ipade-text-secondary">Última modificación</th>
                  <th className="px-4 py-3 text-right font-medium text-ipade-text-secondary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-ipade-border last:border-0 hover:bg-ipade-bg/50">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/profiles/${profile.id}`} className="font-medium text-ipade-primary hover:underline">
                        {profile.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ipade-text-muted">
                      {new Date(profile.updated_at).toLocaleDateString("es-MX", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/profiles/${profile.id}`}
                        className="text-sm text-ipade-primary hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
