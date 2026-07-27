"use client";

import { useState } from "react";
import { ProfileDataTable, type ColumnDef } from "@/components/profile-data-table";
import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";

const logisticsParamsFields: FieldDef[] = [
  { key: "costo_envio_base", label: "Costo de envío base", type: "decimal" },
  { key: "capacidad_almacen_default", label: "Capacidad almacén por defecto (módulos)", type: "number" },
];

const transportColumns: ColumnDef[] = [
  { key: "key", label: "Clave", width: "120px" },
  { key: "name", label: "Nombre" },
  { key: "costo_por_ton_km", label: "Costo/ton·km", type: "decimal", width: "130px" },
  { key: "tiempo_periodos", label: "Tiempo (periodos)", type: "number", width: "130px" },
  { key: "co2_gr_ton_km", label: "CO₂ gr/ton·km", type: "decimal", width: "130px" },
  { key: "active", label: "Activo", type: "boolean", width: "80px" },
];

const routeDistancesColumns: ColumnDef[] = [
  { key: "origin_zone_id", label: "Origen", editable: false },
  { key: "dest_zone_id", label: "Destino", editable: false },
  { key: "distance_km", label: "Distancia (km)", type: "decimal" },
];

const subtabs = [
  { key: "params", label: "Parámetros" },
  { key: "transport", label: "Modos transporte" },
  { key: "routes", label: "Distancias" },
] as const;

export function LogisticaTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
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
          table="logistics_params"
          fields={logisticsParamsFields}
          title="Parámetros de logística"
        />
      )}

      {active === "transport" && (
        <ProfileDataTable
          profileId={profileId}
          table="transport_modes"
          columns={transportColumns}
          orderBy="sort_order"
        />
      )}

      {active === "routes" && (
        <ProfileDataTable
          profileId={profileId}
          table="route_distances"
          columns={routeDistancesColumns}
        />
      )}
    </div>
  );
}
