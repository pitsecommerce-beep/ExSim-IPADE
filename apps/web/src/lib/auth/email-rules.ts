const SUPER_ADMIN_EMAIL = "ftallabs@ipade.mx";

export function isProfessorEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@ipade.mx");
}

export function isParticipantEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@alumni.ipade.mx");
}

export function isSuperAdminEmail(email: string): boolean {
  return email.toLowerCase() === SUPER_ADMIN_EMAIL;
}

export function isAdminRole(role: string | undefined): boolean {
  return role === "admin";
}

export function isApproved(metadata: Record<string, unknown> | undefined): boolean {
  if (!metadata) return false;
  if (isAdminRole(metadata.role as string)) return true;
  return metadata.approved === true;
}

export function getUserDisplayRole(metadata: Record<string, unknown> | undefined): string {
  if (!metadata) return "desconocido";
  const role = metadata.role as string | undefined;
  if (role === "admin") return "Administrador";
  if (role === "professor") return "Profesor";
  if (role === "participant") return "Participante";
  return "desconocido";
}
