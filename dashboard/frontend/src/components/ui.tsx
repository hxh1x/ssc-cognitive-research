import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useFilters } from "../filters";

const NAV: [string, string][] = [
  ["/", "Overview"],
  ["/subject/quant", "Quant"],
  ["/subject/english", "English"],
  ["/subject/reasoning", "Reasoning"],
  ["/subject/ga", "General Awareness"],
  ["/questions", "Questions Explorer"],
  ["/archetypes", "Archetypes / Patterns"],
  ["/traps", "Traps"],
  ["/methods", "Methods"],
  ["/papers", "Year / Shift"],
  ["/quality", "Data Quality"],
  ["/about", "About Dataset"],
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { f, set } = useFilters();
  const nav = useNavigate();
  return (
    <div className="flex h-full">
      <aside className="w-52 shrink-0 border-r border-[#1c2430] bg-[#0d1117] flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-[#1c2430]">
          <div className="text-[13px] font-semibold tracking-wide text-slate-100">SSC CGL · Stage 2</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Evidence explorer · 8,800 PYQs</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `block px-4 py-[7px] text-[12.5px] border-l-2 ${
                  isActive
                    ? "border-sky-400 bg-[#131a24] text-slate-100"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#10151d]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[#1c2430]">
          <label className="text-[10.5px] uppercase tracking-wider text-slate-500">Global search</label>
          <input
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") nav("/questions"); }}
            placeholder="text, ID, trap, method…"
            className="mt-1 w-full rounded-md border border-[#26303e] bg-[#0b0e13] px-2.5 py-1.5 text-[12.5px] placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
          />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-5 py-5">{children}</div>
      </main>
    </div>
  );
}

export function Card({ title, sub, right, children, className = "" }: {
  title?: string; sub?: string; right?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-lg border border-[#1c2430] bg-[#0e1319] ${className}`}>
      {(title || right) && (
        <header className="flex items-baseline justify-between gap-3 border-b border-[#1a2230] px-4 py-2.5">
          <div>
            {title && <h2 className="text-[13px] font-semibold text-slate-100">{title}</h2>}
            {sub && <p className="text-[11.5px] text-slate-500 mt-0.5">{sub}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-[#1c2430] bg-[#0e1319] px-3.5 py-2.5">
      <div className="text-[10.5px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-[19px] font-semibold text-slate-100 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-[#26303e] bg-[#0b0e13] px-2.5 py-1.5 text-[12.5px] focus:border-sky-500 focus:outline-none";

export function Select({ value, onChange, options, allowAll = true, allLabel = "All" }: {
  value: string; onChange: (v: string) => void; options: string[];
  allowAll?: boolean; allLabel?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {allowAll && <option value="">{allLabel}</option>}
      {options.filter(Boolean).map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

export function HBar({ items, maxItems = 12, onClick, barColor = "#38bdf8" }: {
  items: { name: string; count: number }[]; maxItems?: number;
  onClick?: (name: string) => void; barColor?: string;
}) {
  const shown = items.slice(0, maxItems);
  const max = Math.max(1, ...shown.map((i) => i.count));
  return (
    <div className="space-y-1.5">
      {shown.map((i) => (
        <div
          key={i.name}
          onClick={onClick ? () => onClick(i.name) : undefined}
          className={`group ${onClick ? "cursor-pointer" : ""}`}
          title={`${i.name}: ${i.count.toLocaleString()}`}
        >
          <div className="flex items-baseline justify-between gap-2 text-[12px]">
            <span className="truncate text-slate-300 group-hover:text-sky-300">{i.name}</span>
            <span className="shrink-0 tabular-nums text-slate-400">{i.count.toLocaleString()}</span>
          </div>
          <div className="mt-0.5 h-[5px] rounded-full bg-[#1a2230]">
            <div className="h-full rounded-full" style={{ width: `${(100 * i.count) / max}%`, background: barColor }} />
          </div>
        </div>
      ))}
      {items.length > maxItems && (
        <div className="text-[11px] text-slate-500">+ {(items.length - maxItems).toLocaleString()} more</div>
      )}
    </div>
  );
}

export function Heatmap({ rows, cols, get, onCell }: {
  rows: string[]; cols: string[];
  get: (r: string, c: string) => number;
  onCell?: (r: string, c: string) => void;
}) {
  let max = 1;
  rows.forEach((r) => cols.forEach((c) => { max = Math.max(max, get(r, c)); }));
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-[11.5px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-[#0e1319] p-1 text-left font-medium text-slate-500" />
            {cols.map((c) => (
              <th key={c} className="whitespace-nowrap p-1 text-center font-medium text-slate-500">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="sticky left-0 max-w-[220px] truncate bg-[#0e1319] p-1 pr-2 text-slate-300" title={r}>{r}</td>
              {cols.map((c) => {
                const v = get(r, c);
                const a = 0.04 + 0.5 * (v / max);
                return (
                  <td
                    key={c}
                    onClick={onCell ? () => onCell(r, c) : undefined}
                    title={`${r} × ${c}: ${v}`}
                    className={`p-1 text-center tabular-nums ${onCell ? "cursor-pointer" : ""}`}
                    style={{ background: `rgba(56,189,248,${v ? a : 0.02})`, color: v ? "#e2e8f0" : "#475569", minWidth: 44 }}
                  >
                    {v || ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ total, page, perPage, onPage }: {
  total: number; page: number; perPage: number; onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return <div className="text-[11.5px] text-slate-500">{total.toLocaleString()} rows</div>;
  const nums: (number | "…")[] = [];
  [1, page - 1, page, page + 1, pages].forEach((n) => {
    if (n >= 1 && n <= pages && !nums.includes(n)) nums.push(n);
  });
  nums.sort((a, b) => (a as number) - (b as number));
  return (
    <div className="flex items-center gap-1.5 text-[12px]">
      <span className="mr-2 text-slate-500">{total.toLocaleString()} rows · p. {page}/{pages}</span>
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded border border-[#26303e] px-2 py-0.5 disabled:opacity-40">‹</button>
      {nums.map((n, i) => (
        <button
          key={i}
          onClick={() => typeof n === "number" && onPage(n)}
          className={`rounded border px-2 py-0.5 ${n === page ? "border-sky-500 bg-sky-500/10 text-sky-300" : "border-[#26303e]"}`}
        >
          {n}
        </button>
      ))}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded border border-[#26303e] px-2 py-0.5 disabled:opacity-40">›</button>
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div className="py-10 text-center text-[12.5px] text-slate-500">{label}</div>;
}

export function Err({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="py-10 text-center">
      <p className="text-[13px] text-red-400">{message}</p>
      {retry && <button onClick={retry} className="mt-2 rounded border border-[#26303e] px-3 py-1 text-[12px]">Retry</button>}
    </div>
  );
}

export function Drawer({ title, onClose, children, wide = false }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative flex h-full flex-col border-l border-[#26303e] bg-[#0d1117] ${wide ? "w-[720px]" : "w-[560px]"} max-w-[94vw]`}>
        <header className="flex items-center justify-between border-b border-[#1c2430] px-4 py-3">
          <h2 className="text-[13.5px] font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="rounded border border-[#26303e] px-2.5 py-1 text-[12px] text-slate-400 hover:text-slate-100">✕ Close</button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>
      </div>
    </div>
  );
}

export function KV({ k, v, mono = false }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-[#141b25] py-1.5 text-[12.5px] last:border-0">
      <dt className="text-slate-500">{k}</dt>
      <dd className={`text-slate-200 ${mono ? "font-mono text-[12px]" : ""}`}>{v || <span className="text-slate-600">—</span>}</dd>
    </div>
  );
}
