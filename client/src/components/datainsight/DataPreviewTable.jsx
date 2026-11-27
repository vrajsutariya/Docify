import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const DataPreviewTable = ({
  columns = [],
  rows = [],
  onExport,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumnFilter, setSelectedColumnFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Column type icon helper
  const getColumnIcon = (type) => {
    switch (type) {
      case 'numeric':
        return <Hash className="w-3.5 h-3.5 text-brand-orange" title="Numeric" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-accent" title="Date" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-emerald-400" title="Boolean" />;
      default:
        return <Type className="w-3.5 h-3.5 text-light-body/60 dark:text-dark-body/60" title="Text" />;
    }
  };

  // Sorting handler
  const handleSort = (columnName) => {
    setSortConfig((prev) => {
      if (prev.key === columnName) {
        if (prev.direction === 'asc') return { key: columnName, direction: 'desc' };
        return { key: null, direction: 'asc' };
      }
      return { key: columnName, direction: 'asc' };
    });
  };

  // Filter and Sort Rows
  const processedRows = useMemo(() => {
    let result = [...rows];

    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase().trim();
      result = result.filter((row) => {
        if (selectedColumnFilter !== 'all') {
          const val = row[selectedColumnFilter];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(lowerSearch);
        }
        return Object.values(row).some(
          (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(lowerSearch)
        );
      });
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortConfig.direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [rows, searchTerm, selectedColumnFilter, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border shadow-soft">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-light-body dark:text-dark-body absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records across columns..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Filter by column */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-light-body dark:text-dark-body" />
          <select
            value={selectedColumnFilter}
            onChange={(e) => {
              setSelectedColumnFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-2.5 py-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Columns</option>
            {columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Export dropdown / action */}
          {onExport && (
            <div className="flex items-center gap-1.5 ml-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onExport('csv')}
                leftIcon={Download}
                className="!text-xs !py-1.5"
              >
                CSV
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onExport('xlsx')}
                leftIcon={FileSpreadsheet}
                className="!text-xs !py-1.5"
              >
                Excel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden border-light-border dark:border-dark-border">
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border shadow-xs">
              <tr className="text-[11px] font-heading font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
                <th className="py-3 px-3 w-12 text-center text-light-body/50">#</th>
                {columns.map((col) => {
                  const isSorted = sortConfig.key === col.name;

                  return (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className="py-3 px-3.5 cursor-pointer hover:bg-light-border/30 dark:hover:bg-dark-border/30 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        {getColumnIcon(col.type)}
                        <span>{col.name}</span>
                        <span className="text-light-body/40">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-brand-orange" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-brand-orange" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border text-xs">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, rIdx) => {
                  const absoluteIndex = (currentPage - 1) * pageSize + rIdx + 1;

                  return (
                    <tr
                      key={rIdx}
                      className="hover:bg-light-surface/40 dark:hover:bg-dark-surface/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-[10px] text-light-body/50">
                        {absoluteIndex}
                      </td>
                      {columns.map((col) => {
                        const cellVal = row[col.name];
                        const isNull = cellVal === null || cellVal === undefined || cellVal === '';

                        return (
                          <td
                            key={col.name}
                            className={`py-2.5 px-3.5 truncate max-w-xs ${
                              col.type === 'numeric' ? 'font-mono text-right' : ''
                            } ${isNull ? 'text-light-body/30 italic' : 'text-light-heading dark:text-dark-heading'}`}
                          >
                            {isNull ? 'null' : typeof cellVal === 'number' ? cellVal.toLocaleString() : String(cellVal)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="p-12 text-center text-xs text-light-body dark:text-dark-body"
                  >
                    No records found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-t border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40 text-xs">
          <div className="flex items-center gap-2 text-light-body dark:text-dark-body text-[11px]">
            <span>
              Showing <strong>{processedRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
              <strong>{Math.min(currentPage * pageSize, processedRows.length)}</strong> of{' '}
              <strong>{processedRows.length}</strong> records
            </span>
            {processedRows.length !== rows.length && (
              <span className="text-brand-orange font-semibold">(filtered from {rows.length})</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-light-body dark:text-dark-body">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading text-xs"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-border/40 dark:hover:bg-dark-border/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono text-light-heading dark:text-dark-heading">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-border/40 dark:hover:bg-dark-border/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataPreviewTable;
