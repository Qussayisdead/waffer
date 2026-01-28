"use client";

import { useI18n } from "../i18n";

type StoreNavItem = {
  id: string;
  label: string;
};

type StoreSidebarProps = {
  greeting: string;
  items: StoreNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
};

export function StoreSidebar({ greeting, items, activeId, onSelect }: StoreSidebarProps) {
  const { t } = useI18n();

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-6 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:flex">
      <div>
        <div className="text-xs text-night/60">{t("common.hello")}</div>
        <div className="mt-1 text-lg font-semibold text-ink">
          {greeting || t("common.user")}
        </div>
      </div>
      <nav className="space-y-2 text-sm">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={
              item.id === activeId
                ? "block w-full rounded-2xl border border-emerald-300 bg-white/90 px-3 py-2 text-right text-night"
                : "block w-full rounded-2xl border border-transparent px-3 py-2 text-right text-night transition hover:border-emerald-300 hover:bg-white/90"
            }
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
