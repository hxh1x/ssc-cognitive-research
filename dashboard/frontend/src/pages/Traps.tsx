import { useCallback, useEffect, useState } from "react";
import { api, SUBJECTS } from "../api";
import { useFilters } from "../filters";
import { Card, Field, inputCls, Loading, Err, HBar } from "../components/ui";
import { QuestionDrawer } from "../components/QuestionDrawer";

interface TrapRow {
  subject: string; trap: string; count: number;
  topics: { name: string; count: number }[];
  example: string; example_id: string;
}

export default function Traps() {
  const { f, set } = useFilters();
  const [rows, setRows] = useState<TrapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [qid, setQid] = useState<string | null>(null);
  const [debQ, setDebQ] = useState("");

  const fetchRows = useCallback(() => {
    setLoading(true); setErr("");
    api.traps({ subject: f.subject === "all" ? "all" : f.subject, topic: f.topic, q: debQ })
      .then((d) => setRows(d.slice(0, 150)))
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, [f.subject, f.topic, debQ]);
  useEffect(fetchRows, [fetchRows]);

  const bySubject = rows.reduce<Record<string, number>>((m, r) => {
    m[r.subject] = (m[r.subject] ?? 0) + r.count;
    return m;
  }, {});

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">Traps</h1>
        <p className="text-[12px] text-slate-500">
          Heuristic trap labels from Stage 2. Frequencies are observed counts — not objective proof that a trap works.
        </p>
      </div>
      <Card>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <Field label="Subject">
            <select value={f.subject} onChange={(e) => set({ subject: e.target.value, topic: "" })} className={inputCls}>
              <option value="all">All subjects</option>
              {SUBJECTS.map((s) => <option key={s.key} value={s.key}>{s.short}</option>)}
            </select>
          </Field>
          <Field label="Topic (exact)">
            <input value={f.topic} onChange={(e) => set({ topic: e.target.value })} placeholder="filter…" className={inputCls} />
          </Field>
          <Field label="Search traps">
            <input value={debQ} onChange={(e) => setDebQ(e.target.value)} placeholder="text…" className={inputCls} />
          </Field>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card title="Trap volume by subject">
          <HBar items={Object.entries(bySubject).map(([name, count]) => ({ name, count }))} barColor="#fbbf24" />
        </Card>
        <div className="lg:col-span-2">
          <Card title={`Top traps (${rows.length} shown)`}>
            {err && <Err message={err} />}
            {loading && <Loading />}
            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {rows.map((r, i) => (
                <div key={i} className="rounded-md border border-[#1c2430] p-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12.5px] font-medium text-slate-200">{r.trap}</span>
                    <span className="shrink-0 tabular-nums text-[12px] text-amber-300">{r.count.toLocaleString()}×</span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-slate-500">
                    {r.subject} · {r.topics.map((t) => `${t.name} (${t.count})`).join(", ")}
                  </div>
                  <button onClick={() => r.example_id && setQid(r.example_id)}
                    className="mt-1 block max-w-full truncate text-left text-[11.5px] text-sky-400/90 hover:text-sky-300">
                    e.g. {r.example_id}: {r.example}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <QuestionDrawer id={qid} onClose={() => setQid(null)} />
    </div>
  );
}
