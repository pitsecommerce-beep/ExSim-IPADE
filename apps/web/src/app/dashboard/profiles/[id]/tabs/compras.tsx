"use client";

import { useState } from "react";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";

const materialsColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "120px" },
  { key: "name", label: "Nombre" },
  { key: "unidad", label: "Unidad", width: "100px" },
  { key: "sort_order", label: "Orden", type: "number", width: "80px" },
];

const suppliersColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "120px" },
  { key: "name", label: "Nombre" },
  { key: "plazo_pago", label: "Plazo pago (periodos)", type: "number", width: "150px" },
  { key: "sort_order", label: "Orden", type: "number", width: "80px" },
];

const supplierMaterialsColumns: ColumnDef[] = [
  { key: "supplier_id", label: "Proveedor", editable: false },
  { key: "material_id", label: "Material", editable: false },
  { key: "precio", label: "Precio", type: "decimal" },
  { key: "lote_minimo", label: "Lote mínimo", type: "number" },
  { key: "plazo_entrega", label: "Plazo entrega", type: "number" },
  { key: "descuento_pct", label: "Descuento %", type: "decimal", width: "110px" },
  { key: "umbral_descuento", label: "Umbral descuento (u)", type: "number", width: "150px" },
  { key: "prob_incumplimiento", label: "Prob. incumplimiento", type: "decimal", width: "150px" },
  { key: "flete_arancel_unitario", label: "Flete/arancel por u", type: "decimal", width: "140px" },
  { key: "active", label: "Activo", type: "boolean" },
];

const subtabs = [
  { key: "materials", label: "Materiales" },
  { key: "suppliers", label: "Proveedores" },
  { key: "prices", label: "Precios materiales" },
] as const;

export function ComprasTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
  const [active, setActive] = useState(subtab || "materials");

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

      {active === "materials" && (
        <ProfileDataTable
          profileId={profileId}
          table="materials"
          columns={materialsColumns}
          orderBy="sort_order"
        />
      )}

      {active === "suppliers" && (
        <ProfileDataTable
          profileId={profileId}
          table="suppliers"
          columns={suppliersColumns}
          orderBy="sort_order"
        />
      )}

      {active === "prices" && (
        <ProfileDataTable
          profileId={profileId}
          table="supplier_materials"
          columns={supplierMaterialsColumns}
        />
      )}
    </div>
  );
}
