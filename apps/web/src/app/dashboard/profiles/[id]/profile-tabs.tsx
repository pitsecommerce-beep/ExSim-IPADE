"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PrincipalTab } from "./tabs/principal";
import { ComprasTab } from "./tabs/compras";
import { ProduccionTab } from "./tabs/produccion";
import { ComercialTab } from "./tabs/comercial";
import { LogisticaTab } from "./tabs/logistica";
import { PersonasTab } from "./tabs/personas";
import { InnovacionTab } from "./tabs/innovacion";
import { FinanzasTab } from "./tabs/finanzas";
import { EsgTab } from "./tabs/esg";
import { VisibilidadTab } from "./tabs/visibilidad";
import { MarcasTab } from "./tabs/marcas";
import { InformesTab } from "./tabs/informes";
import { NegociacionesTab } from "./tabs/negociaciones";

const tabs = [
  { key: "principal", label: "Principal" },
  { key: "visibilidad", label: "Visibilidad" },
  { key: "marcas", label: "Marcas" },
  { key: "compras", label: "Compras" },
  { key: "produccion", label: "Producción" },
  { key: "comercial", label: "Comercial" },
  { key: "logistica", label: "Logística" },
  { key: "personas", label: "Personas" },
  { key: "innovacion", label: "Innovación" },
  { key: "finanzas", label: "Finanzas" },
  { key: "esg", label: "ESG" },
  { key: "negociaciones", label: "Negociaciones" },
  { key: "informes", label: "Informes" },
] as const;

interface Props {
  profileId: string;
  activeTab: string;
  activeSubtab?: string;
}

const tabComponents: Record<string, React.ComponentType<{ profileId: string; subtab?: string }>> = {
  principal: PrincipalTab,
  compras: ComprasTab,
  produccion: ProduccionTab,
  comercial: ComercialTab,
  logistica: LogisticaTab,
  personas: PersonasTab,
  innovacion: InnovacionTab,
  finanzas: FinanzasTab,
  esg: EsgTab,
  visibilidad: VisibilidadTab,
  marcas: MarcasTab,
  informes: InformesTab,
  negociaciones: NegociacionesTab,
};

export function ProfileTabs({ profileId, activeTab, activeSubtab }: Props) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || activeTab;

  const TabComponent = tabComponents[currentTab];

  return (
    <div>
      <div className="border-b border-ipade-border">
        <nav className="-mb-px flex gap-0 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/dashboard/profiles/${profileId}?tab=${tab.key}`}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-ipade-primary text-ipade-primary"
                    : "border-transparent text-ipade-text-muted hover:border-ipade-border hover:text-ipade-text"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {TabComponent ? (
          <TabComponent profileId={profileId} subtab={activeSubtab} />
        ) : (
          <div className="rounded-lg border border-dashed border-ipade-border bg-ipade-surface p-12 text-center">
            <p className="text-ipade-text-muted">Configuración en desarrollo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
