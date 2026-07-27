"use client";

import { useState } from "react";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";

const zonesColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "120px" },
  { key: "name", label: "Nombre" },
  { key: "active", label: "Activa", type: "boolean", width: "80px" },
  { key: "sort_order", label: "Orden", type: "number", width: "80px" },
];

const segmentsColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "120px" },
  { key: "name", label: "Nombre" },
  { key: "sort_order", label: "Orden", type: "number", width: "80px" },
];

const channelsColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "120px" },
  { key: "name", label: "Nombre" },
  { key: "tipo", label: "Tipo", type: "select", options: [
    { value: "salespeople", label: "Vendedores" },
    { value: "monetary", label: "Monetario" },
  ]},
  { key: "alfa", label: "Alfa (rend. decrec.)", type: "decimal", width: "140px" },
  { key: "kappa", label: "Kappa (escala)", type: "decimal", width: "130px" },
  { key: "active", label: "Activo", type: "boolean", width: "80px" },
];

const mediaColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "100px" },
  { key: "name", label: "Nombre" },
  { key: "costo_spot", label: "Costo/spot", type: "decimal", width: "120px" },
  { key: "limite_spots", label: "Límite spots", type: "number", width: "120px" },
  { key: "alcance", label: "Alcance", type: "select", width: "120px", options: [
    { value: "nacional", label: "Nacional" },
    { value: "regional", label: "Regional" },
  ]},
  { key: "active", label: "Activo", type: "boolean", width: "80px" },
];

const demandParamsColumns: ColumnDef[] = [
  { key: "zone_id", label: "Zona", editable: false },
  { key: "segment_id", label: "Segmento", editable: false },
  { key: "modelo_precio", label: "Modelo precio" },
  { key: "kappa_precio", label: "Kappa precio", type: "decimal" },
  { key: "w_precio", label: "w_precio", type: "decimal" },
  { key: "w_publicidad", label: "w_publicidad", type: "decimal" },
  { key: "w_canal", label: "w_canal", type: "decimal" },
  { key: "w_producto", label: "w_producto", type: "decimal" },
  { key: "demanda_base", label: "Demanda base", type: "decimal" },
];

const productDimensionsColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "140px" },
  { key: "name", label: "Nombre" },
  { key: "valor_inicial", label: "Valor inicial", type: "decimal", width: "120px" },
  { key: "valor_min", label: "Mínimo", type: "decimal", width: "100px" },
  { key: "valor_max", label: "Máximo", type: "decimal", width: "100px" },
];

const subtabs = [
  { key: "zones", label: "Zonas" },
  { key: "segments", label: "Segmentos" },
  { key: "channels", label: "Canales" },
  { key: "media", label: "Medios" },
  { key: "demand", label: "Demanda" },
  { key: "dimensions", label: "Dimensiones" },
] as const;

export function ComercialTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
  const [active, setActive] = useState(subtab || "zones");

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
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

      {active === "zones" && (
        <ProfileDataTable profileId={profileId} table="zones" columns={zonesColumns} orderBy="sort_order" />
      )}
      {active === "segments" && (
        <ProfileDataTable profileId={profileId} table="segments" columns={segmentsColumns} orderBy="sort_order" />
      )}
      {active === "channels" && (
        <ProfileDataTable profileId={profileId} table="channels" columns={channelsColumns} orderBy="sort_order" />
      )}
      {active === "media" && (
        <ProfileDataTable profileId={profileId} table="media" columns={mediaColumns} orderBy="sort_order" />
      )}
      {active === "demand" && (
        <ProfileDataTable profileId={profileId} table="demand_params" columns={demandParamsColumns} />
      )}
      {active === "dimensions" && (
        <ProfileDataTable profileId={profileId} table="product_dimensions" columns={productDimensionsColumns} orderBy="sort_order" />
      )}
    </div>
  );
}
