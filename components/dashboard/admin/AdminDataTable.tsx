import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

/**
 * AdminDataTable
 *
 * Generic reusable table for all admin pages.
 * Columns and rows are fully typed via generics.
 */
export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
  emptyIcon,
}: AdminDataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {emptyIcon && (
            <div className="mb-4 text-slate-300">{emptyIcon}</div>
          )}
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.className ?? ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="transition-colors hover:bg-slate-50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-5 py-4 ${col.className ?? ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
