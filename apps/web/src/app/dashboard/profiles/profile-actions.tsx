"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

interface SheetDef {
  sheet: string;
  table: string;
  type: "params" | "data";
  columns: { key: string; header: string; type?: "text" | "number" | "decimal" | "boolean" }[];
  sample?: Record<string, unknown>;
}

const SHEET_DEFS: SheetDef[] = [
  {
    sheet: "Perfil",
    table: "profiles",
    type: "params",
    columns: [
      { key: "name", header: "Nombre del perfil" },
      { key: "description", header: "Descripción" },
    ],
    sample: { name: "Perfil Ejemplo", description: "Simulación de negocios ejecutivo" },
  },
  {
    sheet: "Parámetros Generales",
    table: "profile_params",
    type: "params",
    columns: [
      { key: "periodos", header: "Periodos", type: "number" },
      { key: "periodos_por_superperiodo", header: "Periodos por superperiodo", type: "number" },
      { key: "subperiodos_por_periodo", header: "Subperiodos por periodo", type: "number" },
      { key: "unidades_por_subperiodo", header: "Unidades por subperiodo", type: "number" },
      { key: "horas_por_periodo", header: "Horas por periodo", type: "number" },
      { key: "moneda", header: "Moneda" },
      { key: "periodos_iniciales", header: "Periodos iniciales", type: "number" },
      { key: "historico", header: "Histórico", type: "boolean" },
      { key: "prompt_debriefing", header: "Prompt debriefing" },
    ],
    sample: {
      periodos: 8, periodos_por_superperiodo: 4, subperiodos_por_periodo: 8,
      unidades_por_subperiodo: 1, horas_por_periodo: 160, moneda: "$",
      periodos_iniciales: 6, historico: false, prompt_debriefing: "",
    },
  },
  {
    sheet: "Textos",
    table: "profile_texts",
    type: "params",
    columns: [
      { key: "nombre_caso", header: "Nombre del caso" },
      { key: "descripcion", header: "Descripción" },
      { key: "instrucciones", header: "Instrucciones" },
    ],
    sample: { nombre_caso: "Caso Ejemplo", descripcion: "", instrucciones: "" },
  },
  {
    sheet: "Zonas",
    table: "zones",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "active", header: "Activo", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Segmentos",
    table: "segments",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Fases Ciclo Vida",
    table: "lifecycle_phases",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Dim. Producto",
    table: "product_dimensions",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "valor_inicial", header: "Valor inicial", type: "decimal" },
      { key: "valor_min", header: "Valor mín.", type: "decimal" },
      { key: "valor_max", header: "Valor máx.", type: "decimal" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Canales",
    table: "channels",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "tipo", header: "Tipo" },
      { key: "alfa", header: "Alfa", type: "decimal" },
      { key: "kappa", header: "Kappa", type: "decimal" },
      { key: "active", header: "Activo", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Medios",
    table: "media",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "costo_spot", header: "Costo spot", type: "decimal" },
      { key: "limite_spots", header: "Límite spots", type: "number" },
      { key: "active", header: "Activo", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Producción Params",
    table: "production_params",
    type: "params",
    columns: [
      { key: "costo_modulo_planta", header: "Costo módulo planta", type: "decimal" },
      { key: "periodos_construccion", header: "Periodos construcción", type: "number" },
      { key: "capacidad_almacen_modulo", header: "Capacidad almacén módulo", type: "number" },
      { key: "costo_almacen_modulo", header: "Costo almacén módulo", type: "decimal" },
      { key: "costo_desecho", header: "Costo desecho", type: "decimal" },
    ],
    sample: {
      costo_modulo_planta: 200000, periodos_construccion: 2,
      capacidad_almacen_modulo: 12, costo_almacen_modulo: 5000, costo_desecho: 0,
    },
  },
  {
    sheet: "Secciones",
    table: "sections",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Máquinas",
    table: "machines",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "capacidad_hora", header: "Capacidad/hora", type: "decimal" },
      { key: "costo_compra", header: "Costo compra", type: "decimal" },
      { key: "costo_instalacion", header: "Costo instalación", type: "decimal" },
      { key: "periodos_instalacion", header: "Periodos instal.", type: "number" },
      { key: "costo_mantenimiento", header: "Costo mantenimiento", type: "decimal" },
      { key: "vida_util", header: "Vida útil", type: "number" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Materiales",
    table: "materials",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "unidad", header: "Unidad" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Proveedores",
    table: "suppliers",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "plazo_pago", header: "Plazo pago", type: "number" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Proveedor-Materiales",
    table: "supplier_materials",
    type: "data",
    columns: [
      { key: "supplier_key", header: "Clave proveedor" },
      { key: "material_key", header: "Clave material" },
      { key: "precio", header: "Precio", type: "decimal" },
      { key: "lote_minimo", header: "Lote mínimo", type: "number" },
      { key: "plazo_entrega", header: "Plazo entrega", type: "number" },
      { key: "active", header: "Activo", type: "boolean" },
    ],
  },
  {
    sheet: "RH Params",
    table: "hr_params",
    type: "params",
    columns: [
      { key: "salario_base", header: "Salario base", type: "decimal" },
      { key: "horas_por_turno", header: "Horas por turno", type: "number" },
      { key: "turnos_por_periodo", header: "Turnos por periodo", type: "number" },
      { key: "costo_contratacion", header: "Costo contratación", type: "decimal" },
      { key: "costo_despido", header: "Costo despido", type: "decimal" },
      { key: "costo_horas_extra_pct", header: "Horas extra %", type: "decimal" },
      { key: "max_horas_extra_pct", header: "Max horas extra %", type: "decimal" },
      { key: "fpr_base", header: "FPR base", type: "decimal" },
      { key: "fpr_max", header: "FPR máx", type: "decimal" },
      { key: "fpr1", header: "FPR 1", type: "decimal" },
      { key: "fpr2", header: "FPR 2", type: "decimal" },
      { key: "fpr3", header: "FPR 3", type: "decimal" },
      { key: "fpr4", header: "FPR 4", type: "decimal" },
      { key: "peso_salario", header: "Peso salario", type: "decimal" },
      { key: "peso_beneficios", header: "Peso beneficios", type: "decimal" },
    ],
    sample: {
      salario_base: 93.75, horas_por_turno: 8, turnos_por_periodo: 20,
      costo_contratacion: 500, costo_despido: 1000, costo_horas_extra_pct: 50,
      max_horas_extra_pct: 25, fpr_base: 0.85, fpr_max: 1.10,
      fpr1: 0.90, fpr2: 0.95, fpr3: 1.00, fpr4: 1.05,
      peso_salario: 0.60, peso_beneficios: 0.40,
    },
  },
  {
    sheet: "Beneficios",
    table: "benefits",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "tipo_curva", header: "Tipo curva" },
      { key: "x_min", header: "X mín", type: "decimal" },
      { key: "x_max", header: "X máx", type: "decimal" },
      { key: "y_min", header: "Y mín", type: "decimal" },
      { key: "y_max", header: "Y máx", type: "decimal" },
      { key: "weight", header: "Peso", type: "decimal" },
      { key: "unidad", header: "Unidad" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Finanzas Params",
    table: "finance_params",
    type: "params",
    columns: [
      { key: "tasa_linea_credito", header: "Tasa línea crédito", type: "decimal" },
      { key: "tasa_deposito", header: "Tasa depósito", type: "decimal" },
      { key: "tasa_hipoteca", header: "Tasa hipoteca", type: "decimal" },
      { key: "tasa_emergencia", header: "Tasa emergencia", type: "decimal" },
      { key: "limite_hipoteca", header: "Límite hipoteca", type: "decimal" },
      { key: "plazo_hipoteca", header: "Plazo hipoteca", type: "number" },
      { key: "plazo_cobro_default", header: "Plazo cobro default", type: "number" },
      { key: "impuesto_renta_pct", header: "Impuesto renta %", type: "decimal" },
    ],
    sample: {
      tasa_linea_credito: 10, tasa_deposito: 4, tasa_hipoteca: 6,
      tasa_emergencia: 30, limite_hipoteca: 500000, plazo_hipoteca: 12,
      plazo_cobro_default: 2, impuesto_renta_pct: 30,
    },
  },
  {
    sheet: "Logística Params",
    table: "logistics_params",
    type: "params",
    columns: [
      { key: "costo_envio_base", header: "Costo envío base", type: "decimal" },
      { key: "capacidad_almacen_default", header: "Capacidad almacén default", type: "number" },
    ],
    sample: { costo_envio_base: 0, capacidad_almacen_default: 48 },
  },
  {
    sheet: "Transporte",
    table: "transport_modes",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "costo_por_ton_km", header: "Costo/ton·km", type: "decimal" },
      { key: "tiempo_periodos", header: "Tiempo (periodos)", type: "number" },
      { key: "co2_gr_ton_km", header: "CO₂ gr/ton·km", type: "decimal" },
      { key: "active", header: "Activo", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Mejoras",
    table: "improvements",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "costo", header: "Costo", type: "decimal" },
      { key: "periodos_desarrollo", header: "Periodos desarrollo", type: "number" },
      { key: "activa", header: "Activa", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "ESG Params",
    table: "esg_params",
    type: "params",
    columns: [
      { key: "factor_electricidad_co2", header: "Factor electricidad (grCO₂/kWh)", type: "decimal" },
      { key: "factor_construccion_co2", header: "Factor construcción (grCO₂/m²)", type: "decimal" },
      { key: "kg_co2_desecho_reciclaje", header: "kg CO₂ desecho reciclaje", type: "decimal" },
      { key: "kg_co2_desecho_transporte", header: "kg CO₂ desecho transporte", type: "decimal" },
      { key: "periodos_amortizacion_construccion", header: "Periodos amort. construcción", type: "number" },
    ],
    sample: {
      factor_electricidad_co2: 400, factor_construccion_co2: 500,
      kg_co2_desecho_reciclaje: 12, kg_co2_desecho_transporte: 1.2,
      periodos_amortizacion_construccion: 12,
    },
  },
  {
    sheet: "ESG Componentes",
    table: "esg_components",
    type: "data",
    columns: [
      { key: "tipo", header: "Tipo" },
      { key: "nombre", header: "Nombre" },
      { key: "inversion_unitaria", header: "Inversión unitaria", type: "decimal" },
      { key: "vida_util_periodos", header: "Vida útil", type: "number" },
      { key: "costo_mantenimiento_pct", header: "Mant. %", type: "decimal" },
      { key: "costo_mantenimiento_fijo", header: "Mant. fijo", type: "decimal" },
      { key: "kwh_generados_periodo", header: "kWh/periodo", type: "decimal" },
      { key: "co2_offset_periodo", header: "CO₂ offset/periodo", type: "decimal" },
      { key: "sobrecosto_energia_pct", header: "Sobrecosto energía %", type: "decimal" },
      { key: "horizonte_credito", header: "Horizonte crédito", type: "number" },
      { key: "arboles_por_lote", header: "Árboles/lote", type: "number" },
      { key: "activo", header: "Activo", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Marcas Params",
    table: "brand_params",
    type: "params",
    columns: [
      { key: "multi_brand_enabled", header: "Multi-marca habilitado", type: "boolean" },
      { key: "perception_lag", header: "Rezago de percepción", type: "boolean" },
      { key: "brand_equity_decay", header: "Decaimiento brand equity", type: "decimal" },
      { key: "brand_equity_initial", header: "Brand equity inicial", type: "decimal" },
      { key: "actualizacion_percepcion", header: "Actualización percepción", type: "decimal" },
    ],
    sample: {
      multi_brand_enabled: false, perception_lag: true,
      brand_equity_decay: 0.1, brand_equity_initial: 0.5, actualizacion_percepcion: 0.5,
    },
  },
  {
    sheet: "Visibilidad",
    table: "visibility_params",
    type: "params",
    columns: [
      { key: "movimiento_maquinas", header: "Movimiento máquinas", type: "boolean" },
      { key: "alquiler_maquinas", header: "Alquiler máquinas", type: "boolean" },
      { key: "hipoteca", header: "Hipoteca", type: "boolean" },
      { key: "factoraje", header: "Factoraje", type: "boolean" },
      { key: "prestamo_accionista", header: "Préstamo accionista", type: "boolean" },
      { key: "dividendos", header: "Dividendos", type: "boolean" },
      { key: "emision_acciones", header: "Emisión acciones", type: "boolean" },
      { key: "ver_precios_competencia", header: "Ver precios competencia", type: "boolean" },
      { key: "ver_cuota_mercado", header: "Ver cuota mercado", type: "boolean" },
      { key: "ver_produccion_competencia", header: "Ver producción competencia", type: "boolean" },
      { key: "ver_finanzas_competencia", header: "Ver finanzas competencia", type: "boolean" },
      { key: "ver_costos_detallados", header: "Ver costos detallados", type: "boolean" },
    ],
    sample: {
      movimiento_maquinas: true, alquiler_maquinas: false, hipoteca: true,
      factoraje: false, prestamo_accionista: false, dividendos: true,
      emision_acciones: false, ver_precios_competencia: true, ver_cuota_mercado: true,
      ver_produccion_competencia: false, ver_finanzas_competencia: false,
      ver_costos_detallados: true,
    },
  },
  {
    sheet: "Tipos Informe",
    table: "report_types",
    type: "data",
    columns: [
      { key: "key", header: "Clave" },
      { key: "name", header: "Nombre" },
      { key: "costo", header: "Costo", type: "decimal" },
      { key: "active", header: "Activo", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
];

function parseValue(raw: unknown, type?: string): unknown {
  const s = String(raw ?? "").trim();
  if (s === "") return type === "number" ? 0 : type === "decimal" ? 0 : type === "boolean" ? false : "";
  if (type === "number") return parseInt(s) || 0;
  if (type === "decimal") return parseFloat(s) || 0;
  if (type === "boolean") return s === "true" || s === "1" || s.toLowerCase() === "si" || s.toLowerCase() === "sí" || s === "TRUE";
  return s;
}

function parseSheetRows(ws: XLSX.WorkSheet, def: SheetDef): Record<string, unknown>[] {
  const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
  const headerMap = new Map<string, typeof def.columns[number]>();
  for (const col of def.columns) {
    headerMap.set(col.header.toLowerCase(), col);
    headerMap.set(col.key.toLowerCase(), col);
  }

  return rawRows.map((row) => {
    const parsed: Record<string, unknown> = {};
    for (const [rawKey, rawVal] of Object.entries(row)) {
      const col = headerMap.get(rawKey.toLowerCase());
      if (!col) continue;
      parsed[col.key] = parseValue(rawVal, col.type);
    }
    return parsed;
  }).filter((r) => Object.keys(r).length > 0);
}

export function ProfileActions() {
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  async function handleCreate() {
    setCreating(true);
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .insert({ name: "Nuevo Perfil", created_by: user.id })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      setCreating(false);
      return;
    }
    router.push(`/dashboard/profiles/${data.id}`);
  }

  function handleDownloadTemplate() {
    const wb = XLSX.utils.book_new();

    for (const def of SHEET_DEFS) {
      const headers = def.columns.map((c) => c.header);
      const data: unknown[][] = [headers];

      if (def.type === "params" && def.sample) {
        data.push(def.columns.map((c) => {
          const v = def.sample![c.key];
          if (typeof v === "boolean") return v ? "true" : "false";
          return v ?? "";
        }));
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = def.columns.map((c) => ({
        wch: Math.max(c.header.length + 2, 18),
      }));
      XLSX.utils.book_append_sheet(wb, ws, def.sheet);
    }

    XLSX.writeFile(wb, "plantilla_perfil_completa.xlsx");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);

    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setImporting(false); return; }

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });

      const profileDef = SHEET_DEFS.find((d) => d.table === "profiles")!;
      const profileSheet = wb.Sheets[profileDef.sheet];
      if (!profileSheet) throw new Error("Hoja 'Perfil' no encontrada en el archivo");

      const profileRows = parseSheetRows(profileSheet, profileDef);
      const profileName = String(profileRows[0]?.name || "Perfil Importado").trim();
      const profileDesc = String(profileRows[0]?.description || "").trim();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({ name: profileName, description: profileDesc, created_by: user.id })
        .select("id")
        .single();

      if (profileError) throw new Error(`Error creando perfil: ${profileError.message}`);
      const profileId = profile.id;

      const keyMaps: Record<string, Map<string, string>> = {};

      for (const def of SHEET_DEFS) {
        if (def.table === "profiles") continue;

        const ws = wb.Sheets[def.sheet];
        if (!ws) continue;

        const rows = parseSheetRows(ws, def);
        if (rows.length === 0) continue;

        if (def.type === "params") {
          const payload: Record<string, unknown> = { profile_id: profileId };
          const row = rows[0]!;
          for (const col of def.columns) {
            if (row[col.key] !== undefined) payload[col.key] = row[col.key];
          }
          const { error } = await supabase.from(def.table).upsert(payload, { onConflict: "profile_id" });
          if (error) console.error(`Error upserting ${def.table}:`, error.message);
        } else if (def.table === "supplier_materials") {
          const supplierKeys = keyMaps["suppliers"];
          const materialKeys = keyMaps["materials"];
          if (!supplierKeys || !materialKeys) continue;

          for (const row of rows) {
            const suppKey = String(row["supplier_key"] || "").trim();
            const matKey = String(row["material_key"] || "").trim();
            const suppId = supplierKeys.get(suppKey);
            const matId = materialKeys.get(matKey);
            if (!suppId || !matId) continue;

            const payload: Record<string, unknown> = {
              profile_id: profileId,
              supplier_id: suppId,
              material_id: matId,
            };
            for (const col of def.columns) {
              if (col.key !== "supplier_key" && col.key !== "material_key" && row[col.key] !== undefined) {
                payload[col.key] = row[col.key];
              }
            }
            const { error } = await supabase.from(def.table).insert(payload);
            if (error) console.error(`Error inserting ${def.table}:`, error.message);
          }
        } else {
          const insertedRows: Record<string, unknown>[] = [];
          for (const row of rows) {
            const payload: Record<string, unknown> = { profile_id: profileId, ...row };
            const { data, error } = await supabase
              .from(def.table)
              .insert(payload)
              .select("id, key")
              .single();

            if (error) {
              console.error(`Error inserting ${def.table}:`, error.message);
            } else if (data) {
              insertedRows.push(data);
            }
          }

          if (insertedRows.length > 0 && insertedRows[0] && "key" in insertedRows[0]) {
            const map = new Map<string, string>();
            for (const r of insertedRows) {
              map.set(String(r.key), String(r.id));
            }
            keyMaps[def.table] = map;
          }
        }
      }

      router.push(`/dashboard/profiles/${profileId}`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleExport() {
    const supabase = getSupabase();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("name, created_at, updated_at")
      .order("name");

    if (!profiles || profiles.length === 0) return;

    const wsData = [
      ["nombre", "creado", "actualizado"],
      ...profiles.map((p: Record<string, unknown>) => [
        p.name,
        new Date(p.created_at as string).toLocaleDateString("es-MX"),
        new Date(p.updated_at as string).toLocaleDateString("es-MX"),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Perfiles");
    XLSX.writeFile(wb, "perfiles_exsim.xlsx");
  }

  return (
    <div className="flex items-center gap-2">
      {importError && (
        <div className="mr-2 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600">
          {importError}
          <button onClick={() => setImportError(null)} className="ml-2 font-medium underline">×</button>
        </div>
      )}
      <button
        onClick={handleDownloadTemplate}
        className="rounded-md border border-ipade-border px-3 py-2 text-sm text-ipade-text-secondary hover:bg-ipade-bg"
        title="Descargar plantilla Excel completa"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        className="rounded-md border border-ipade-border px-3 py-2 text-sm text-ipade-text-secondary hover:bg-ipade-bg disabled:opacity-50"
        title="Importar perfil desde Excel"
      >
        {importing ? (
          <span className="text-xs">Importando...</span>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        )}
      </button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
      <button
        onClick={handleExport}
        className="rounded-md border border-ipade-border px-3 py-2 text-sm text-ipade-text-secondary hover:bg-ipade-bg"
        title="Exportar listado de perfiles"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </button>
      <button
        onClick={handleCreate}
        disabled={creating}
        className="rounded-md bg-ipade-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
      >
        {creating ? "Creando..." : "Nuevo Perfil"}
      </button>
    </div>
  );
}
