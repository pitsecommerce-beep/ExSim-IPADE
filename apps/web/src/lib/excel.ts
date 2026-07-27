import * as XLSX from "xlsx";

export interface ExcelColumn {
  key: string;
  header: string;
  type?: "text" | "number" | "decimal" | "boolean";
}

export function generateTemplate(
  columns: ExcelColumn[],
  sheetName: string,
  sampleRows?: Record<string, unknown>[]
): XLSX.WorkBook {
  const headers = columns.map((c) => c.header);
  const data: unknown[][] = [headers];

  if (sampleRows) {
    for (const row of sampleRows) {
      data.push(columns.map((c) => row[c.key] ?? ""));
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = columns.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
}

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

export function parseExcelFile(
  data: ArrayBuffer,
  columns: ExcelColumn[]
): Record<string, unknown>[] {
  const wb = XLSX.read(new Uint8Array(data), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]!];
  if (!ws) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
  const headerMap = new Map<string, ExcelColumn>();
  for (const col of columns) {
    headerMap.set(col.header.toLowerCase(), col);
    headerMap.set(col.key.toLowerCase(), col);
  }

  return rows.map((row) => {
    const parsed: Record<string, unknown> = {};
    for (const [rawKey, rawVal] of Object.entries(row)) {
      const col = headerMap.get(rawKey.toLowerCase());
      if (!col) continue;
      if (col.type === "number") parsed[col.key] = parseInt(String(rawVal)) || 0;
      else if (col.type === "decimal") parsed[col.key] = parseFloat(String(rawVal)) || 0;
      else if (col.type === "boolean") parsed[col.key] = rawVal === "true" || rawVal === "1" || rawVal === "si" || rawVal === "Si";
      else parsed[col.key] = String(rawVal ?? "");
    }
    return parsed;
  });
}

export function exportToExcel(
  rows: Record<string, unknown>[],
  columns: ExcelColumn[],
  sheetName: string,
  filename: string
) {
  const data: unknown[][] = [columns.map((c) => c.header)];
  for (const row of rows) {
    data.push(columns.map((c) => row[c.key] ?? ""));
  }
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = columns.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
