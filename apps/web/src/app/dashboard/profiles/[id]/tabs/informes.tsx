"use client";

import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";

const reportTypesColumns: ColumnDef[] = [
  { key: "key", label: "Clave" },
  { key: "name", label: "Nombre" },
  { key: "costo", label: "Costo", type: "decimal", width: "120px" },
  { key: "active", label: "Activo", type: "boolean", width: "80px" },
  { key: "sort_order", label: "Orden", type: "number", width: "80px" },
];

export function InformesTab({ profileId }: { profileId: string; subtab?: string }) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-ipade-text">Tipos de Informe</h3>
      <p className="mb-4 text-sm text-ipade-text-muted">
        Configura los informes disponibles para los participantes y su costo.
      </p>
      <ProfileDataTable
        profileId={profileId}
        table="report_types"
        columns={reportTypesColumns}
        orderBy="sort_order"
      />
    </div>
  );
}
