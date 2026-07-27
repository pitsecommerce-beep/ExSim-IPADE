"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

interface SheetDef {
  sheet: string;
  table: string;
  type: "params" | "data";
  columns: ColDef[];
  sample?: Record<string, unknown>;
  required?: string[];
}

interface ColDef {
  key: string;
  header: string;
  type?: "text" | "number" | "decimal" | "boolean";
  required?: boolean;
  allowedValues?: string[];
}

interface ValidationError {
  sheet: string;
  row: number;
  column: string;
  value: string;
  expected: string;
}

const SHEET_DEFS: SheetDef[] = [
  {
    sheet: "Perfil",
    table: "profiles",
    type: "params",
    columns: [
      { key: "name", header: "Nombre del perfil", required: true },
      { key: "description", header: "Descripción" },
    ],
    required: ["name"],
    sample: { name: "Perfil Ejemplo", description: "Simulación de negocios ejecutivo" },
  },
  {
    sheet: "Parámetros Generales",
    table: "profile_params",
    type: "params",
    columns: [
      { key: "periodos", header: "Periodos", type: "number", required: true },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "active", header: "Activo", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Segmentos",
    table: "segments",
    type: "data",
    columns: [
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Fases Ciclo Vida",
    table: "lifecycle_phases",
    type: "data",
    columns: [
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Dim. Producto",
    table: "product_dimensions",
    type: "data",
    columns: [
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "tipo", header: "Tipo", allowedValues: ["salespeople", "monetary"] },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Máquinas",
    table: "machines",
    type: "data",
    columns: [
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "unidad", header: "Unidad" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Proveedores",
    table: "suppliers",
    type: "data",
    columns: [
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "plazo_pago", header: "Plazo pago", type: "number" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
  {
    sheet: "Proveedor-Materiales",
    table: "supplier_materials",
    type: "data",
    columns: [
      { key: "supplier_key", header: "Clave proveedor", required: true },
      { key: "material_key", header: "Clave material", required: true },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "tipo_curva", header: "Tipo curva", allowedValues: ["linear", "concave", "convex", "threshold"] },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
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
      { key: "tipo", header: "Tipo", required: true, allowedValues: ["solar_panel", "green_energy", "tree", "co2_credit"] },
      { key: "nombre", header: "Nombre", required: true },
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
      { key: "key", header: "Clave", required: true },
      { key: "name", header: "Nombre", required: true },
      { key: "costo", header: "Costo", type: "decimal" },
      { key: "active", header: "Activo", type: "boolean" },
      { key: "sort_order", header: "Orden", type: "number" },
    ],
  },
];

const BOOL_TRUE = new Set(["true", "1", "si", "sí", "yes", "verdadero"]);
const BOOL_FALSE = new Set(["false", "0", "no", "", "falso"]);
const BOOL_ALL = new Set([...BOOL_TRUE, ...BOOL_FALSE]);

function isBooleanLike(s: string): boolean {
  return BOOL_ALL.has(s.toLowerCase().trim());
}

function isIntegerLike(s: string): boolean {
  return /^-?\d+$/.test(s.trim());
}

function isDecimalLike(s: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(s.trim());
}

function parseValue(raw: unknown, type?: string): unknown {
  const s = String(raw ?? "").trim();
  if (s === "") return type === "number" ? 0 : type === "decimal" ? 0 : type === "boolean" ? false : "";
  if (type === "number") return parseInt(s) || 0;
  if (type === "decimal") return parseFloat(s) || 0;
  if (type === "boolean") return BOOL_TRUE.has(s.toLowerCase());
  return s;
}

function buildHeaderMap(def: SheetDef) {
  const headerMap = new Map<string, ColDef>();
  for (const col of def.columns) {
    headerMap.set(col.header.toLowerCase(), col);
    headerMap.set(col.key.toLowerCase(), col);
  }
  return headerMap;
}

function validateSheet(
  ws: XLSX.WorkSheet,
  def: SheetDef,
  supplierKeys?: Set<string>,
  materialKeys?: Set<string>,
): { rows: Record<string, unknown>[]; errors: ValidationError[] } {
  const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
  const headerMap = buildHeaderMap(def);
  const errors: ValidationError[] = [];
  const rows: Record<string, unknown>[] = [];

  if (def.type === "data" && rawRows.length === 0) {
    return { rows: [], errors: [] };
  }

  const seenKeys = new Set<string>();

  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i]!;
    const excelRow = i + 2;
    const parsed: Record<string, unknown> = {};
    const matched = new Set<string>();

    for (const [rawKey, rawVal] of Object.entries(rawRow)) {
      const col = headerMap.get(rawKey.toLowerCase());
      if (!col) continue;
      matched.add(col.key);
      const s = String(rawVal ?? "").trim();

      if (col.required && s === "") {
        errors.push({
          sheet: def.sheet,
          row: excelRow,
          column: col.header,
          value: "(vacío)",
          expected: "Valor requerido — no puede estar vacío",
        });
        continue;
      }

      if (s === "") {
        parsed[col.key] = parseValue("", col.type);
        continue;
      }

      if (col.type === "number" && !isIntegerLike(s)) {
        errors.push({
          sheet: def.sheet,
          row: excelRow,
          column: col.header,
          value: s,
          expected: `Número entero (ej: 8, 12, 160)`,
        });
        continue;
      }

      if (col.type === "decimal" && !isDecimalLike(s)) {
        errors.push({
          sheet: def.sheet,
          row: excelRow,
          column: col.header,
          value: s,
          expected: `Número decimal (ej: 0.85, 200000, 1.2)`,
        });
        continue;
      }

      if (col.type === "boolean" && !isBooleanLike(s)) {
        errors.push({
          sheet: def.sheet,
          row: excelRow,
          column: col.header,
          value: s,
          expected: `Booleano: true/false, si/no, 1/0`,
        });
        continue;
      }

      if (col.allowedValues && !col.allowedValues.includes(s)) {
        errors.push({
          sheet: def.sheet,
          row: excelRow,
          column: col.header,
          value: s,
          expected: `Uno de: ${col.allowedValues.join(", ")}`,
        });
        continue;
      }

      if (col.key === "key" && def.type === "data") {
        if (seenKeys.has(s)) {
          errors.push({
            sheet: def.sheet,
            row: excelRow,
            column: col.header,
            value: s,
            expected: `Clave única — "${s}" ya existe en otra fila`,
          });
        }
        seenKeys.add(s);
      }

      if (def.table === "supplier_materials") {
        if (col.key === "supplier_key" && supplierKeys && !supplierKeys.has(s)) {
          errors.push({
            sheet: def.sheet,
            row: excelRow,
            column: col.header,
            value: s,
            expected: `Clave de proveedor que exista en la hoja "Proveedores"`,
          });
        }
        if (col.key === "material_key" && materialKeys && !materialKeys.has(s)) {
          errors.push({
            sheet: def.sheet,
            row: excelRow,
            column: col.header,
            value: s,
            expected: `Clave de material que exista en la hoja "Materiales"`,
          });
        }
      }

      parsed[col.key] = parseValue(rawVal, col.type);
    }

    for (const col of def.columns) {
      if (col.required && !matched.has(col.key)) {
        errors.push({
          sheet: def.sheet,
          row: excelRow,
          column: col.header,
          value: "(no encontrado)",
          expected: "Columna requerida faltante en la hoja",
        });
      }
    }

    if (Object.keys(parsed).length > 0) rows.push(parsed);
  }

  return { rows, errors };
}

function ValidationModal({
  errors,
  onClose,
}: {
  errors: ValidationError[];
  onClose: () => void;
}) {
  const grouped = new Map<string, ValidationError[]>();
  for (const e of errors) {
    const list = grouped.get(e.sheet) || [];
    list.push(e);
    grouped.set(e.sheet, list);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">
                {errors.length} {errors.length === 1 ? "error encontrado" : "errores encontrados"}
              </h3>
              <p className="text-sm text-red-600">Corrige los siguientes valores antes de importar.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-red-400 hover:bg-red-100 hover:text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {Array.from(grouped.entries()).map(([sheet, sheetErrors]) => (
            <div key={sheet} className="mb-5 last:mb-0">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ipade-text">
                <svg className="h-4 w-4 text-ipade-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Hoja: {sheet}
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {sheetErrors.length}
                </span>
              </h4>
              <div className="overflow-hidden rounded-lg border border-ipade-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ipade-bg text-xs text-ipade-text-muted">
                    <tr>
                      <th className="px-3 py-2">Fila</th>
                      <th className="px-3 py-2">Columna</th>
                      <th className="px-3 py-2">Valor actual</th>
                      <th className="px-3 py-2">Se espera</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ipade-border">
                    {sheetErrors.map((err, j) => (
                      <tr key={j} className="hover:bg-red-50/50">
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{err.row}</td>
                        <td className="px-3 py-2 font-medium text-ipade-text">{err.column}</td>
                        <td className="px-3 py-2">
                          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">{err.value}</code>
                        </td>
                        <td className="px-3 py-2 text-xs text-ipade-text-muted">{err.expected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-ipade-border bg-ipade-bg px-6 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-ipade-primary px-4 py-2 text-sm font-medium text-white hover:bg-ipade-primary/90"
          >
            Entendido — Corregir y volver a importar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileActions() {
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
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
      const typeHints = def.columns.map((c) => {
        const parts: string[] = [];
        if (c.required) parts.push("REQUERIDO");
        if (c.type === "number") parts.push("entero");
        else if (c.type === "decimal") parts.push("decimal");
        else if (c.type === "boolean") parts.push("true/false");
        else parts.push("texto");
        if (c.allowedValues) parts.push(`(${c.allowedValues.join("|")})`);
        return parts.join(" · ");
      });
      const data: unknown[][] = [headers, typeHints];

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
    setValidationErrors([]);

    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setImporting(false); return; }

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });

      // --- PHASE 1: Validate ALL sheets before touching the database ---
      const allErrors: ValidationError[] = [];
      const parsedSheets = new Map<string, Record<string, unknown>[]>();

      // Collect keys from data sheets for cross-reference validation
      const supplierKeysFromSheet = new Set<string>();
      const materialKeysFromSheet = new Set<string>();

      // First pass: extract keys from suppliers/materials for FK validation
      for (const def of SHEET_DEFS) {
        const ws = wb.Sheets[def.sheet];
        if (!ws || def.type !== "data") continue;
        const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        // Skip row 2 (type hints row from template)
        const filteredRows = rawRows.filter((row) => {
          const firstVal = String(Object.values(row)[0] ?? "").toLowerCase().trim();
          return !firstVal.startsWith("requerido") && !firstVal.startsWith("entero") &&
                 !firstVal.startsWith("decimal") && !firstVal.startsWith("texto") &&
                 !firstVal.startsWith("true/false");
        });
        if (def.table === "suppliers") {
          for (const row of filteredRows) {
            const k = String(row["Clave"] ?? row["key"] ?? "").trim();
            if (k) supplierKeysFromSheet.add(k);
          }
        }
        if (def.table === "materials") {
          for (const row of filteredRows) {
            const k = String(row["Clave"] ?? row["key"] ?? "").trim();
            if (k) materialKeysFromSheet.add(k);
          }
        }
      }

      for (const def of SHEET_DEFS) {
        const ws = wb.Sheets[def.sheet];
        if (!ws) {
          if (def.table === "profiles") {
            allErrors.push({
              sheet: def.sheet,
              row: 0,
              column: "-",
              value: "(hoja no encontrada)",
              expected: `La hoja "${def.sheet}" es obligatoria`,
            });
          }
          continue;
        }

        // Filter out the type-hints row added by the template
        const rawAll = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        const filtered = rawAll.filter((row) => {
          const firstVal = String(Object.values(row)[0] ?? "").toLowerCase().trim();
          return !firstVal.startsWith("requerido") && !firstVal.startsWith("entero") &&
                 !firstVal.startsWith("decimal") && !firstVal.startsWith("texto") &&
                 !firstVal.startsWith("true/false");
        });

        // Re-create worksheet from filtered rows for validation
        const filteredWs = XLSX.utils.json_to_sheet(filtered);

        const { rows, errors } = validateSheet(
          filteredWs,
          def,
          def.table === "supplier_materials" ? supplierKeysFromSheet : undefined,
          def.table === "supplier_materials" ? materialKeysFromSheet : undefined,
        );
        allErrors.push(...errors);
        parsedSheets.set(def.table, rows);
      }

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        setImporting(false);
        if (fileRef.current) fileRef.current.value = "";
        return;
      }

      // --- PHASE 2: All validated — now create records ---
      const profileRows = parsedSheets.get("profiles") || [];
      const profileName = String(profileRows[0]?.name || "Perfil Importado").trim();
      const profileDesc = String(profileRows[0]?.description || "").trim();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({ name: profileName, created_by: user.id })
        .select("id")
        .single();

      if (!profileError && profileDesc) {
        const textsRows = parsedSheets.get("profile_texts") || [];
        const existingDesc = String(textsRows[0]?.descripcion || "").trim();
        if (!existingDesc) {
          if (textsRows.length > 0) {
            textsRows[0]!.descripcion = profileDesc;
          } else {
            parsedSheets.set("profile_texts", [{ descripcion: profileDesc }]);
          }
        }
      }

      if (profileError) throw new Error(`Error creando perfil: ${profileError.message}`);
      const profileId = profile.id;

      const keyMaps: Record<string, Map<string, string>> = {};

      for (const def of SHEET_DEFS) {
        if (def.table === "profiles") continue;

        const rows = parsedSheets.get(def.table);
        if (!rows || rows.length === 0) continue;

        if (def.type === "params") {
          const payload: Record<string, unknown> = { profile_id: profileId };
          const row = rows[0]!;
          for (const col of def.columns) {
            if (row[col.key] !== undefined) payload[col.key] = row[col.key];
          }
          const { error } = await supabase.from(def.table).upsert(payload, { onConflict: "profile_id" });
          if (error) console.error(`Error upserting ${def.table}:`, error.message);
        } else if (def.table === "supplier_materials") {
          const supplierKeyMap = keyMaps["suppliers"];
          const materialKeyMap = keyMaps["materials"];
          if (!supplierKeyMap || !materialKeyMap) continue;

          for (const row of rows) {
            const suppKey = String(row["supplier_key"] || "").trim();
            const matKey = String(row["material_key"] || "").trim();
            const suppId = supplierKeyMap.get(suppKey);
            const matId = materialKeyMap.get(matKey);
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
    <>
      {validationErrors.length > 0 && (
        <ValidationModal
          errors={validationErrors}
          onClose={() => setValidationErrors([])}
        />
      )}
      <div className="flex items-center gap-2">
        {importError && (
          <div className="mr-2 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600">
            {importError}
            <button onClick={() => setImportError(null)} className="ml-2 font-medium underline">x</button>
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
    </>
  );
}
