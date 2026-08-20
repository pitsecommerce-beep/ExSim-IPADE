"use client";

import { useState, useEffect, useCallback } from "react";
import { isSuperAdminEmail } from "@/lib/auth/email-rules";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  approved: boolean;
  created_at: string;
}

interface AdminData {
  pendingProfessors: UserRow[];
  approvedProfessors: UserRow[];
  admins: UserRow[];
}

export function AdminPanel({ currentEmail }: { currentEmail: string }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "professors" | "admins">("pending");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const isSuperAdmin = isSuperAdminEmail(currentEmail);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Error al cargar usuarios");
      setLoading(false);
      return;
    }
    const d: AdminData = await res.json();
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function handleApprove(userId: string) {
    setActionLoading(userId);
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Error al aprobar");
    }
    setActionLoading(null);
    void loadUsers();
  }

  async function handleReject(userId: string) {
    if (!confirm("Esto eliminara permanentemente la cuenta del profesor. Continuar?")) return;
    setActionLoading(userId);
    const res = await fetch("/api/admin/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Error al rechazar");
    }
    setActionLoading(null);
    void loadUsers();
  }

  async function handleChangeRole(userId: string, newRole: string) {
    const label = newRole === "admin" ? "administrador" : "profesor";
    if (!confirm(`Cambiar rol a ${label}?`)) return;
    setActionLoading(userId);
    const res = await fetch("/api/admin/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Error al cambiar rol");
    }
    setActionLoading(null);
    void loadUsers();
  }

  async function handleInviteAdmin(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);

    if (!inviteEmail.endsWith("@ipade.mx")) {
      setInviteError("Solo correos @ipade.mx pueden ser administradores");
      return;
    }

    setActionLoading("invite");
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, fullName: inviteName }),
    });

    if (!res.ok) {
      const err = await res.json();
      setInviteError(err.error ?? "Error al invitar");
    } else {
      setInviteSuccess(true);
      setInviteEmail("");
      setInviteName("");
      void loadUsers();
    }
    setActionLoading(null);
  }

  async function handleRevokeApproval(userId: string) {
    if (!confirm("Revocar acceso a este profesor? No podra iniciar sesion hasta ser aprobado de nuevo.")) return;
    setActionLoading(userId);
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, revoke: true }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Error al revocar");
    }
    setActionLoading(null);
    void loadUsers();
  }

  if (loading) {
    return <div className="text-ipade-text-muted">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={loadUsers} className="mt-3 text-sm font-medium text-ipade-primary hover:underline">
          Reintentar
        </button>
      </div>
    );
  }

  const pendingCount = data?.pendingProfessors.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-ipade-border">
        <TabButton
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
          badge={pendingCount > 0 ? pendingCount : undefined}
        >
          Pendientes
        </TabButton>
        <TabButton active={activeTab === "professors"} onClick={() => setActiveTab("professors")}>
          Profesores
        </TabButton>
        {isSuperAdmin && (
          <TabButton active={activeTab === "admins"} onClick={() => setActiveTab("admins")}>
            Administradores
          </TabButton>
        )}
      </div>

      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingCount === 0 ? (
            <div className="rounded-xl border border-dashed border-ipade-border bg-white p-12 text-center">
              <p className="text-ipade-text-muted">No hay registros pendientes de aprobacion.</p>
            </div>
          ) : (
            data!.pendingProfessors.map((u) => (
              <UserCard key={u.id} user={u} actionLoading={actionLoading}>
                <button
                  onClick={() => handleApprove(u.id)}
                  disabled={actionLoading === u.id}
                  className="rounded-md bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleReject(u.id)}
                  disabled={actionLoading === u.id}
                  className="rounded-md bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Rechazar
                </button>
              </UserCard>
            ))
          )}
        </div>
      )}

      {activeTab === "professors" && (
        <div className="space-y-4">
          {(data?.approvedProfessors.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-ipade-border bg-white p-12 text-center">
              <p className="text-ipade-text-muted">No hay profesores aprobados.</p>
            </div>
          ) : (
            data!.approvedProfessors.map((u) => (
              <UserCard key={u.id} user={u} actionLoading={actionLoading}>
                {isSuperAdmin && (
                  <>
                    <button
                      onClick={() => handleChangeRole(u.id, "admin")}
                      disabled={actionLoading === u.id}
                      className="rounded-md bg-ipade-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Promover a Admin
                    </button>
                    <button
                      onClick={() => handleRevokeApproval(u.id)}
                      disabled={actionLoading === u.id}
                      className="rounded-md border border-red-300 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Revocar Acceso
                    </button>
                  </>
                )}
              </UserCard>
            ))
          )}
        </div>
      )}

      {activeTab === "admins" && isSuperAdmin && (
        <div className="space-y-6">
          <div className="rounded-xl border border-ipade-border bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-ipade-text">Invitar Administrador</h3>
            <form onSubmit={handleInviteAdmin} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-ipade-text-muted">Nombre</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text"
                  placeholder="Nombre completo"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-ipade-text-muted">Correo @ipade.mx</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text"
                  placeholder="admin@ipade.mx"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading === "invite"}
                className="rounded-md bg-ipade-accent px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Invitar
              </button>
            </form>
            {inviteError && <p className="mt-2 text-sm text-red-500">{inviteError}</p>}
            {inviteSuccess && <p className="mt-2 text-sm text-green-600">Administrador invitado exitosamente.</p>}
          </div>

          <div className="space-y-4">
            {(data?.admins ?? []).map((u) => (
              <UserCard key={u.id} user={u} actionLoading={actionLoading}>
                {!isSuperAdminEmail(u.email) && (
                  <button
                    onClick={() => handleChangeRole(u.id, "professor")}
                    disabled={actionLoading === u.id}
                    className="rounded-md border border-amber-300 px-4 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                  >
                    Cambiar a Profesor
                  </button>
                )}
                {isSuperAdminEmail(u.email) && (
                  <span className="rounded-full bg-ipade-gold/20 px-3 py-1 text-xs font-medium text-ipade-gold">
                    Super Admin
                  </span>
                )}
              </UserCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
        active
          ? "border-b-2 border-ipade-accent text-ipade-accent"
          : "text-ipade-text-muted hover:text-ipade-text"
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function UserCard({
  user,
  actionLoading,
  children,
}: {
  user: UserRow;
  actionLoading: string | null;
  children: React.ReactNode;
}) {
  const isLoading = actionLoading === user.id;
  const createdAt = new Date(user.created_at).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`rounded-xl border border-ipade-border bg-white p-4 shadow-sm transition-opacity ${isLoading ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-ipade-text">
            {user.full_name || user.email}
          </p>
          <p className="text-sm text-ipade-text-muted">{user.email}</p>
          <p className="mt-1 text-xs text-ipade-text-muted">
            Registrado: {createdAt}
          </p>
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
