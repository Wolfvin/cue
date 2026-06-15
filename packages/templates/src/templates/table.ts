/**
 * Table template — generates a data table with column headers,
 * rows, row numbers, and optional status indicators.
 */

import type { TableTemplateConfig, TableColumn, TableRow, ResolvedTheme } from "../types";

/** Default columns when none are provided. */
const DEFAULT_COLUMNS: TableColumn[] = [
  { header: "Name" },
  { header: "Status" },
  { header: "Amount" },
  { header: "Date" },
];

/** Default rows when none are provided. */
const DEFAULT_ROWS: TableRow[] = [
  { cells: ["Alice Johnson", "Active", "$1,200", "2025-01-15"], status: "success" },
  { cells: ["Bob Smith", "Pending", "$850", "2025-02-03"], status: "warning" },
  { cells: ["Carol Davis", "Inactive", "$0", "2024-11-20"], status: "error" },
  { cells: ["Dan Wilson", "Active", "$2,300", "2025-03-08"], status: "success" },
];

/**
 * Render a data table template as an HTML string.
 */
export function renderTable(config: TableTemplateConfig, theme: ResolvedTheme): string {
  const {
    title = "Data Table",
    columns = DEFAULT_COLUMNS,
    rows = DEFAULT_ROWS,
    showRowNumbers = true,
  } = config;

  const colCount = columns.length + (showRowNumbers ? 1 : 0);

  const headerCells: string[] = [];
  if (showRowNumbers) headerCells.push(`<th class="tbl-th tbl-th-num">#</th>`);
  columns.forEach((c) => {
    const width = c.width ? ` style="width:${c.width}"` : "";
    headerCells.push(`<th class="tbl-th"${width}>${esc(c.header)}</th>`);
  });

  const bodyRows = rows.map((row, i) => {
    const statusClass = row.status && row.status !== "default" ? ` tbl-row-${row.status}` : "";
    const cells: string[] = [];
    if (showRowNumbers) cells.push(`<td class="tbl-td tbl-td-num">${i + 1}</td>`);
    row.cells.forEach((cell) => {
      cells.push(`<td class="tbl-td">${esc(cell)}</td>`);
    });
    return `<tr class="tbl-row${statusClass}">${cells.join("")}</tr>`;
  });

  return `<div class="tbl-wrapper">
  <div class="tbl-header">
    <h1 class="tbl-title">${esc(title)}</h1>
    <span class="tbl-count">${rows.length} rows</span>
  </div>
  <div class="tbl-scroll">
    <table class="tbl-table">
      <thead><tr>${headerCells.join("")}</tr></thead>
      <tbody>${bodyRows.join("\n")}</tbody>
    </table>
  </div>
</div>`;
}

/** HTML-escape a string. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** CSS for the table template. */
export function tableCSS(t: ResolvedTheme): string {
  return `<style>
.tbl-wrapper{height:100%;padding:24px;background:var(--t-bg);display:flex;flex-direction:column;overflow:hidden}
.tbl-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.tbl-title{font-size:20px;font-weight:700;color:var(--t-text)}
.tbl-count{font-size:12px;color:var(--t-text-dim);background:var(--t-bg-input);padding:4px 10px;border-radius:20px}
.tbl-scroll{flex:1;overflow:auto;border:1px solid var(--t-border);border-radius:var(--t-radius)}
.tbl-table{width:100%;border-collapse:collapse;font-size:13px}
.tbl-th{padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--t-text-muted);text-transform:uppercase;letter-spacing:.5px;background:var(--t-bg-card);border-bottom:1px solid var(--t-border);position:sticky;top:0}
.tbl-th-num{width:40px;text-align:center}
.tbl-td{padding:10px 14px;color:var(--t-text);border-bottom:1px solid var(--t-border)}
.tbl-td-num{color:var(--t-text-dim);text-align:center;font-size:11px}
.tbl-row:last-child .tbl-td{border-bottom:none}
.tbl-row-success .tbl-td:nth-child(2){color:#22c55e}
.tbl-row-warning .tbl-td:nth-child(2){color:#f59e0b}
.tbl-row-error .tbl-td:nth-child(2){color:#ef4444}
.tbl-row:hover{background:rgba(255,255,255,.02)}
</style>`;
}
