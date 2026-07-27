"use client";

import { useState } from "react";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";

const improvementsColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "140px" },
  { key: "name", label: "Nombre" },
  { key: "costo", label: "Costo", type: "decimal", width: "120px" },
  { key: "periodos_desarrollo", label: "Periodos desarrollo", type: "number", width: "150px" },
  { key: "costo_variable_unitario", label: "Costo variable/u", type: "decimal", width: "130px" },
  { key: "periodos_amortizacion", label: "Periodos amort.", type: "number", width: "120px" },
  { key: "activa", label: "Activa", type: "boolean", width: "80px" },
  { key: "sort_order", label: "Orden", type: "number", width: "80px" },
];

const improvementDimensionsColumns: ColumnDef[] = [
  { key: "improvement_id", label: "Mejora", editable: false },
  { key: "dimension_id", label: "Dimensión", editable: false },
  { key: "delta", label: "Delta", type: "decimal" },
];

const subtabs = [
  { key: "improvements", label: "Mejoras" },
  { key: "impact", label: "Impacto por dimensión" },
] as const;

export function InnovacionTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
  const [active, setActive] = useState(subtab || "improvements");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {subtabs.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active === s.key
                ? "bg-ipade-primary text-white"
                : "text-ipade-text-muted hover:bg-ipade-bg hover:text-ipade-text"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {active === "improvements" && (
        <ProfileDataTable
          profileId={profileId}
          table="improvements"
          columns={improvementsColumns}
          orderBy="sort_order"
        />
      )}

      {active === "impact" && (
        <ProfileDataTable
          profileId={profileId}
          table="improvement_dimensions"
          columns={improvementDimensionsColumns}
        />
      )}
    </div>
  );
}
