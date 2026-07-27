"use client";

import { useState } from "react";
import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";

const balanceFields: FieldDef[] = [
  { key: "efectivo", label: "Efectivo", type: "decimal" },
  { key: "cuentas_por_cobrar", label: "Cuentas por cobrar", type: "decimal" },
  { key: "inventario", label: "Inventario", type: "decimal" },
  { key: "activo_fijo_planta", label: "Activo fijo planta", type: "decimal" },
  { key: "activo_fijo_equipo_neto", label: "Activo fijo equipo neto", type: "decimal" },
  { key: "intangibles_neto", label: "Intangibles neto", type: "decimal" },
  { key: "cuentas_por_pagar", label: "Cuentas por pagar", type: "decimal" },
  { key: "impuestos_por_pagar", label: "Impuestos por pagar", type: "decimal" },
  { key: "linea_credito", label: "Línea de crédito", type: "decimal" },
  { key: "hipoteca", label: "Hipoteca", type: "decimal" },
  { key: "prestamo_emergencia", label: "Préstamo emergencia", type: "decimal" },
  { key: "capital_emitido", label: "Capital emitido", type: "decimal" },
  { key: "utilidades_retenidas", label: "Utilidades retenidas", type: "decimal" },
  { key: "resultado_periodo", label: "Resultado del periodo", type: "decimal" },
  { key: "depositos_corto_plazo", label: "Depósitos corto plazo", type: "decimal" },
];

const zonesColumns: ColumnDef[] = [
  { key: "zone_id", label: "Zona", editable: false },
  { key: "modulos_almacen", label: "Módulos almacén", type: "number", width: "130px" },
  { key: "precio", label: "Precio", type: "decimal", width: "120px" },
  { key: "plan_pago_key", label: "Plan pago", width: "100px" },
  { key: "vendedores", label: "Vendedores", type: "number", width: "110px" },
];

const machinesColumns: ColumnDef[] = [
  { key: "machine_id", label: "Máquina", editable: false },
  { key: "section_id", label: "Sección", editable: false },
  { key: "cantidad", label: "Cantidad", type: "number", width: "110px" },
];

const subtabs = [
  { key: "balance", label: "Balance" },
  { key: "zones", label: "Zonas" },
  { key: "machines", label: "Máquinas" },
] as const;

export function EstadoInicialTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
  const [active, setActive] = useState(subtab || "balance");

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

      {active === "balance" && (
        <ProfileParamsForm
          profileId={profileId}
          table="initial_state"
          fields={balanceFields}
          title="Estado inicial — Balance"
        />
      )}

      {active === "zones" && (
        <ProfileDataTable
          profileId={profileId}
          table="initial_state_zones"
          columns={zonesColumns}
        />
      )}

      {active === "machines" && (
        <ProfileDataTable
          profileId={profileId}
          table="initial_state_machines"
          columns={machinesColumns}
        />
      )}
    </div>
  );
}
