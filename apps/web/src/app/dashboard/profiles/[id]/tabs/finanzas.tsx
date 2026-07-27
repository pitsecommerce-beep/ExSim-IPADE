"use client";

import { useState } from "react";
import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";

const financeFields: FieldDef[] = [
  { key: "tasa_linea_credito", label: "Tasa línea de crédito (%)", type: "decimal" },
  { key: "tasa_deposito", label: "Tasa depósito (%)", type: "decimal" },
  { key: "tasa_hipoteca", label: "Tasa hipoteca (%)", type: "decimal" },
  { key: "tasa_emergencia", label: "Tasa emergencia (%)", type: "decimal" },
  { key: "limite_hipoteca", label: "Límite hipoteca", type: "decimal" },
  { key: "plazo_hipoteca", label: "Plazo hipoteca (periodos)", type: "number" },
  { key: "plazo_cobro_default", label: "Plazo cobro por defecto (periodos)", type: "number" },
  { key: "impuesto_renta_pct", label: "Impuesto sobre renta (%)", type: "decimal" },
];

const paymentPlansColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "100px" },
  { key: "name", label: "Nombre" },
  { key: "plazo_subperiodos", label: "Plazo (subperiodos)", type: "number", width: "150px" },
  { key: "descuento_pct", label: "Descuento %", type: "decimal", width: "120px" },
  { key: "sort_order", label: "Orden", type: "number", width: "80px" },
];

const subtabs = [
  { key: "params", label: "Parámetros" },
  { key: "payment_plans", label: "Planes de pago" },
] as const;

export function FinanzasTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
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
          table="finance_params"
          fields={financeFields}
          title="Parámetros financieros"
        />
      )}

      {active === "payment_plans" && (
        <ProfileDataTable
          profileId={profileId}
          table="payment_plans"
          columns={paymentPlansColumns}
          orderBy="sort_order"
        />
      )}
    </div>
  );
}
