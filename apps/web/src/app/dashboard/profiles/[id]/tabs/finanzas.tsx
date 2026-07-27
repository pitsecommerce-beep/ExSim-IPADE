"use client";

import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";

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

export function FinanzasTab({ profileId }: { profileId: string; subtab?: string }) {
  return (
    <ProfileParamsForm
      profileId={profileId}
      table="finance_params"
      fields={financeFields}
      title="Parámetros financieros"
    />
  );
}
