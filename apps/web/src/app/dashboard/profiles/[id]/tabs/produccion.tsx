"use client";

import { useState } from "react";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";
import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";

const productionParamsFields: FieldDef[] = [
  { key: "costo_modulo_planta", label: "Costo módulo planta", type: "decimal" },
  { key: "periodos_construccion", label: "Periodos de construcción", type: "number" },
  { key: "capacidad_almacen_modulo", label: "Capacidad almacén (módulos)", type: "number" },
  { key: "costo_almacen_modulo", label: "Costo módulo almacén", type: "decimal" },
  { key: "costo_desecho", label: "Costo desecho por unidad", type: "decimal" },
];

const sectionsColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "120px" },
  { key: "name", label: "Nombre" },
  { key: "sort_order", label: "Orden", type: "number", width: "80px" },
];

const machinesColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "100px" },
  { key: "name", label: "Nombre" },
  { key: "capacidad_hora", label: "Capacidad/hora", type: "decimal", width: "120px" },
  { key: "costo_compra", label: "Costo compra", type: "decimal", width: "120px" },
  { key: "costo_instalacion", label: "Costo instalación", type: "decimal", width: "130px" },
  { key: "periodos_instalacion", label: "Periodos inst.", type: "number", width: "110px" },
  { key: "costo_mantenimiento", label: "Costo mant.", type: "decimal", width: "120px" },
  { key: "vida_util", label: "Vida útil", type: "number", width: "100px" },
];

const sectionMachinesColumns: ColumnDef[] = [
  { key: "section_id", label: "Sección", editable: false },
  { key: "machine_id", label: "Máquina", editable: false },
  { key: "requerido", label: "Requerido", type: "boolean" },
];

const subtabs = [
  { key: "params", label: "Parámetros" },
  { key: "sections", label: "Secciones" },
  { key: "machines", label: "Máquinas" },
  { key: "assignment", label: "Asignación" },
] as const;

export function ProduccionTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
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
          table="production_params"
          fields={productionParamsFields}
          title="Parámetros de producción"
        />
      )}

      {active === "sections" && (
        <ProfileDataTable
          profileId={profileId}
          table="sections"
          columns={sectionsColumns}
          orderBy="sort_order"
        />
      )}

      {active === "machines" && (
        <ProfileDataTable
          profileId={profileId}
          table="machines"
          columns={machinesColumns}
          orderBy="sort_order"
        />
      )}

      {active === "assignment" && (
        <ProfileDataTable
          profileId={profileId}
          table="section_machines"
          columns={sectionMachinesColumns}
        />
      )}
    </div>
  );
}
