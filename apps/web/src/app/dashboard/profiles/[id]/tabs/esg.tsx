"use client";

import { useState } from "react";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";
import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";

const esgParamsFields: FieldDef[] = [
  { key: "factor_electricidad_co2", label: "Factor electricidad (grCO₂/kWh)", type: "decimal" },
  { key: "factor_construccion_co2", label: "Factor construcción (grCO₂/m²)", type: "decimal" },
  { key: "kg_co2_desecho_reciclaje", label: "kg CO₂ desecho reciclaje", type: "decimal" },
  { key: "kg_co2_desecho_transporte", label: "kg CO₂ desecho transporte", type: "decimal" },
  { key: "periodos_amortizacion_construccion", label: "Periodos amortización construcción", type: "number" },
];

const esgComponentsColumns: ColumnDef[] = [
  { key: "tipo", label: "Tipo", type: "select", width: "140px", options: [
    { value: "solar_panel", label: "Panel solar" },
    { value: "green_energy", label: "Energía verde" },
    { value: "tree", label: "Árboles" },
    { value: "co2_credit", label: "Crédito CO₂" },
  ]},
  { key: "nombre", label: "Nombre" },
  { key: "inversion_unitaria", label: "Inversión unit.", type: "decimal", width: "120px" },
  { key: "vida_util_periodos", label: "Vida útil", type: "number", width: "100px" },
  { key: "co2_offset_periodo", label: "CO₂ offset/per.", type: "decimal", width: "130px" },
  { key: "activo", label: "Activo", type: "boolean", width: "80px" },
];

const materialEmissionsColumns: ColumnDef[] = [
  { key: "material_id", label: "Material", editable: false },
  { key: "supplier_id", label: "Proveedor", editable: false },
  { key: "kg_co2_por_unidad", label: "kg CO₂/unidad", type: "decimal" },
];

const subtabs = [
  { key: "params", label: "Factores de emisión" },
  { key: "components", label: "Componentes ESG" },
  { key: "materials", label: "Emisiones materiales" },
] as const;

export function EsgTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
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
          table="esg_params"
          fields={esgParamsFields}
          title="Factores de emisión"
        />
      )}

      {active === "components" && (
        <ProfileDataTable
          profileId={profileId}
          table="esg_components"
          columns={esgComponentsColumns}
          orderBy="sort_order"
        />
      )}

      {active === "materials" && (
        <ProfileDataTable
          profileId={profileId}
          table="esg_material_emissions"
          columns={materialEmissionsColumns}
        />
      )}
    </div>
  );
}
