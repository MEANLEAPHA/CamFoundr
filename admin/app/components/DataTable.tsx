"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  keyExtractor?: (row: T, index: number) => string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = "No records found",
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(15,23,42,0.8)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ background: "rgba(15,23,42,0.5)" }}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map((row, i) => (
                  <tr
                    key={
                      keyExtractor ? keyExtractor(row, i) : String(i)
                    }
                    className="transition-colors"
                    style={{ background: "rgba(15,23,42,0.5)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(30,41,59,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(15,23,42,0.5)";
                    }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-slate-300 ${col.className ?? ""}`}
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div
          className="flex items-center justify-between px-4 py-3 border-t border-slate-800"
          style={{ background: "rgba(8,12,24,0.8)" }}
        >
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-slate-800"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-slate-800"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
