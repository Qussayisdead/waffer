type Column<T> = {
  key: keyof T;
  label: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  renderActions
}: {
  columns: Column<T>[];
  rows: T[];
  renderActions?: (row: T) => React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl border border-white/60 p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-dusk/70">
            {columns.map((col) => (
              <th key={String(col.key)} className="pb-3 text-right font-medium">
                {col.label}
              </th>
            ))}
            {renderActions && <th className="pb-3 text-right font-medium">إجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/50">
              {columns.map((col) => (
                <td key={String(col.key)} className="py-3 text-ink">
                  {String(row[col.key] ?? "")}
                </td>
              ))}
              {renderActions && <td className="py-3 text-ink">{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
