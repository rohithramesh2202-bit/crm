import EmptyState from "./EmptyState";

/**
 * columns: [{ header, accessor: (row) => node, className }]
 */
const DataTable = ({ columns, rows, loading, emptyMessage = "No records yet.", rowAccent }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={row._id || ri}
              className="border-b border-slate-50 last:border-0 hover:bg-teal-50/30 transition-colors"
              style={rowAccent ? { borderLeft: `3px solid ${rowAccent(row)}` } : undefined}
            >
              {columns.map((col, ci) => (
                <td key={ci} className={`px-4 py-3 align-middle text-ink-800 ${col.className || ""}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
