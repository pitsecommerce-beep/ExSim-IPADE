"use client";

import { useState } from "react";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";
import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";

const hrParamsFields: FieldDef[] = [
  { key: "salario_base", label: "Salario base", type: "decimal" },
  { key: "horas_por_turno", label: "Horas por turno", type: "number" },
  { key: "turnos_por_periodo", label: "Turnos por periodo", type: "number" },
  { key: "costo_contratacion", label: "Costo contratación", type: "decimal" },
  { key: "costo_despido", label: "Costo despido", type: "decimal" },
  { key: "costo_horas_extra_pct", label: "Sobrecosto h. extra (%)", type: "decimal" },
  { key: "max_horas_extra_pct", label: "Máx. h. extra (%)", type: "decimal" },
  { key: "fpr_base", label: "FPR base", type: "decimal", step: "0.01" },
  { key: "fpr_max", label: "FPR máximo", type: "decimal", step: "0.01" },
  { key: "fpr1", label: "FPR₁ (sat=0.25)", type: "decimal", step: "0.01" },
  { key: "fpr2", label: "FPR₂ (sat=0.50)", type: "decimal", step: "0.01" },
  { key: "fpr3", label: "FPR₃ (sat=0.75)", type: "decimal", step: "0.01" },
  { key: "fpr4", label: "FPR₄ (sat=1.00)", type: "decimal", step: "0.01" },
  { key: "peso_salario", label: "Peso salario en satisfacción", type: "decimal", step: "0.01" },
  { key: "peso_beneficios", label: "Peso beneficios en satisfacción", type: "decimal", step: "0.01" },
];

const benefitsColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "140px" },
  { key: "name", label: "Nombre" },
  { key: "tipo_curva", label: "Curva", type: "select", width: "120px", options: [
    { value: "linear", label: "Lineal" },
    { value: "concave", label: "Cóncava" },
    { value: "convex", label: "Convexa" },
    { value: "threshold", label: "Umbral" },
  ]},
  { key: "x_min", label: "X mín", type: "decimal", width: "90px" },
  { key: "x_max", label: "X máx", type: "decimal", width: "90px" },
  { key: "y_min", label: "Y mín", type: "decimal", width: "90px" },
  { key: "y_max", label: "Y máx", type: "decimal", width: "90px" },
  { key: "weight", label: "Peso", type: "decimal", width: "90px" },
];

const subtabs = [
  { key: "params", label: "Parámetros RH" },
  { key: "benefits", label: "Beneficios" },
] as const;

export function PersonasTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
  const [active, setActive] = useState(subtab || "params");

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

      {active === "params" && (
        <ProfileParamsForm
          profileId={profileId}
          table="hr_params"
          fields={hrParamsFields}
          title="Parámetros de recursos humanos"
        />
      )}

      {active === "benefits" && (
        <ProfileDataTable
          profileId={profileId}
          table="benefits"
          columns={benefitsColumns}
          orderBy="sort_order"
        />
      )}
    </div>
  );
}
