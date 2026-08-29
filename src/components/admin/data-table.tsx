import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminColumn } from "@/types/admin";

function renderCell(column: AdminColumn, row: Record<string, unknown>) {
  const value = row[column.name];
  if (column.format) return column.format(value, row);
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Presentation-only table used by every admin resource screen. */
export function DataTable({
  columns,
  rows,
  rowKey,
  actions,
  emptyMessage = "Kayıt bulunamadı.",
}: {
  columns: AdminColumn[];
  rows: Record<string, unknown>[];
  rowKey: (row: Record<string, unknown>) => string;
  actions?: (row: Record<string, unknown>) => ReactNode;
  emptyMessage?: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;

  return (
    <div className="surface-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.name}>{column.label}</TableHead>
            ))}
            {actions ? <TableHead className="text-right">İşlem</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.name} className="max-w-[22rem] truncate align-top text-sm">
                  {renderCell(column, row)}
                </TableCell>
              ))}
              {actions ? <TableCell className="text-right">{actions(row)}</TableCell> : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
