export interface WorldData {
  id: string;
  name: string;
  currentPeriod: number;
  empresas: EmpresaData[];
  zonas: ZonaData[];
  config: WorldConfig;
  periodos: PeriodoData[];
}

export interface EmpresaData {
  id: string;
  nombre: string;
}

export interface ZonaData {
  id: string;
  nombre: string;
  fase: "rollout" | "growth" | "maturity" | "hypermaturity";
  distribuidores: number;
  limitePrecioAlto: number;
  limitePrecioBajo: number;
  demandaAlto: number;
  demandaBajo: number;
}

export interface WorldConfig {
  kappaPrecioAlto: number;
  kappaPrecioBajo: number;
  canalAlfa: number;
  canalKappa: number;
  valorInicialDimension: number;
}

export interface PeriodoData {
  periodo: number;
  decisiones: DecisionData[];
  resultados?: unknown;
  conocimiento?: Record<string, Record<string, { alto: number; bajo: number }>>;
  cuotaAsignada?: Record<string, Record<string, { alto: number; bajo: number }>>;
}

export interface DecisionData {
  empresaId: string;
  zonaId: string;
  precio: number;
  vendedores: number;
  spotsTV: number;
  enfoqueMarcaTV: number;
  spotsRadio: number;
  enfoqueMarcaRadio: number;
  mejorasActivas: string[];
  productoTerminado: number;
  previsionDemanda: number;
}

export interface StorageAdapter {
  listWorlds(): Promise<WorldData[]>;
  getWorld(id: string): Promise<WorldData | null>;
  saveWorld(world: WorldData): Promise<void>;
  deleteWorld(id: string): Promise<void>;
}
