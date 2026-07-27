"use client";

import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";

const brandFields: FieldDef[] = [
  { key: "multi_brand_enabled", label: "Multi-marca habilitado", type: "boolean" },
  { key: "perception_lag", label: "Rezago de percepción", type: "boolean" },
  { key: "brand_equity_decay", label: "Decaimiento brand equity", type: "decimal", step: "0.01" },
  { key: "brand_equity_initial", label: "Brand equity inicial", type: "decimal", step: "0.01" },
  { key: "actualizacion_percepcion", label: "Actualización percepción", type: "decimal", step: "0.01" },
];

export function MarcasTab({ profileId }: { profileId: string; subtab?: string }) {
  return (
    <ProfileParamsForm
      profileId={profileId}
      table="brand_params"
      fields={brandFields}
      title="Parámetros de Marca"
    />
  );
}
