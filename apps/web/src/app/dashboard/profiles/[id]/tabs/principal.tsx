"use client";

import { useState } from "react";
import { ProfileParamsForm, type FieldDef } from "@/components/profile-params-form";

const paramsFields: FieldDef[] = [
  { key: "periodos", label: "Periodos", type: "number" },
  { key: "periodos_por_superperiodo", label: "Periodos por superperiodo", type: "number" },
  { key: "subperiodos_por_periodo", label: "Subperiodos por periodo", type: "number" },
  { key: "unidades_por_subperiodo", label: "Unidades por subperiodo", type: "number" },
  { key: "horas_por_periodo", label: "Horas por periodo", type: "number" },
  { key: "moneda", label: "Moneda", type: "text" },
  { key: "periodos_iniciales", label: "Periodos iniciales", type: "number" },
  { key: "historico", label: "Histórico", type: "boolean" },
  { key: "prompt_debriefing", label: "Prompt para debriefing", type: "textarea", placeholder: "Instrucciones para el debriefing automático..." },
];

const textFields: FieldDef[] = [
  { key: "nombre_caso", label: "Nombre del caso", type: "text" },
  { key: "descripcion", label: "Descripción", type: "textarea", placeholder: "Descripción del caso de simulación..." },
  { key: "instrucciones", label: "Instrucciones para participantes", type: "textarea", placeholder: "Instrucciones que verán los participantes..." },
];

const subtabs = [
  { key: "params", label: "Parámetros" },
  { key: "texts", label: "Textos" },
] as const;

export function PrincipalTab({ profileId, subtab }: { profileId: string; subtab?: string }) {
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
          table="profile_params"
          fields={paramsFields}
          title="Parámetros generales"
        />
      )}

      {active === "texts" && (
        <ProfileParamsForm
          profileId={profileId}
          table="profile_texts"
          fields={textFields}
          title="Textos del caso"
        />
      )}
    </div>
  );
}
