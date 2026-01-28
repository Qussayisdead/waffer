type Column<T> = {
  key: keyof T;
  label: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  renderActions,
  actionsLabel
}: {
  columns: Column<T>[];
  rows: T[];
  renderActions?: (row: T) => React.ReactNode;
  actionsLabel?: string;
}) {
  return (
    <div className="glass rounded-3xl border border-white/70 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-night/60">
            {columns.map((col) => (
              <th key={String(col.key)} className="pb-3 text-right font-medium">
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th className="pb-3 text-right font-medium">{actionsLabel || "Actions"}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/60">
              {columns.map((col) => (
                <td key={String(col.key)} className="py-3 text-night">
                  {String(row[col.key] ?? "")}
                </td>
              ))}
              {renderActions && <td className="py-3 text-night">{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
