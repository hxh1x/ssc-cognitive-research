import { useCallback, useEffect, useState } from "react";
import { api, SUBJECTS } from "../api";
import { useFilters } from "../filters";
import { Card, Field, inputCls, Loading, Err, HBar } from "../components/ui";
import { QuestionDrawer } from "../components/QuestionDrawer";

export default function Papers() {
  const { f, set } = useFilters();
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<{ year: string; shift: string; subject: string } | null>(null);
  const [qs, setQs] = useState<any[]>([]);
  const [qTotal, setQTotal] = useState(0);
  const [qid, setQid] = useState<string | null>(null);

  const fetchTree = useCallback(() => {
    setLoading(true); setErr("");
    api.yearShifts({ year: f.year, subject: f.subject === "all" ? "" : f.subject })
      .then(setTree).catch((e) => setErr(String(e))).finally(() => setLoading(false));
  }, [f.year, f.subject]);
  useEffect(fetchTree, [fetchTree]);

  const openPaper = (year: string, shift: string, subject: string) => {
    setSel({ year, shift, subject });
    api.questions({ subject, year, shift, per_page: 100 }).then((d) => {
      setQs(d.items); setQTotal(d.total);
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">Year / Shift explorer</h1>
        <p className="text-[12px] text-slate-500">Inspect paper composition, e.g. 2024 → 12 September → Shift 1 → Quant (25 questions).</p>
      </div>
      <Card>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <Field label="Year">
            <input value={f.year} onChange={(e) => set({ year: e.target.value })} placeholder="e.g. 2024" className={inputCls} />
          </Field>
          <Field label="Subject">
            <select value={f.subject} onChange={(e) => set({ subject: e.target.value })} className={inputCls}>
              <option value="all">All subjects</option>
              {SUBJECTS.map((s) => <option key={s.key} value={s.key}>{s.short}</option>)}
            </select>
          </Field>
        </div>
      </Card>
      {err && <Err message={err} />}
      {loading && <Loading />}
      <div className="space-y-2.5">
        {tree.map((y) => (
          <Card key={y.year} title={y.year} sub={`${y.shifts.reduce((a: number, s: any) => a + s.total, 0).toLocaleString()} questions this year`}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {y.shifts.map((s: any) => (
                <div key={s.shift} className="rounded-md border border-[#1c2430] p-2.5">
                  <div className="text-[12.5px] font-medium text-slate-200">{s.shift}</div>
                  <div className="mt-1 space-y-0.5 text-[11.5px] text-slate-400">
                    {Object.entries(s.subjects as Record<string, number>).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-2">
                        <button onClick={() => openPaper(y.year, s.shift, k)} className="text-sky-400 hover:text-sky-300">
                          {k} · {v} Qs →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {sel && (
        <Card
          title={`${sel.year} · ${sel.shift} · ${sel.subject} — ${qTotal} questions`}
          right={<button onClick={() => setSel(null)} className="text-[12px] text-slate-400">Close</button>}
        >
          <div className="mb-3">
            <HBar items={Object.entries(
              qs.reduce<Record<string, number>>((m, r: any) => {
                const t = r.Topic ?? r.Domain ?? "";
                m[t] = (m[t] ?? 0) + 1; return m;
              }, {})
            ).map(([name, count]) => ({ name, count }))} maxItems={25} />
          </div>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {qs.map((r: any) => (
              <button key={r.Question_ID} onClick={() => setQid(r.Question_ID)}
                className="block w-full truncate rounded border border-[#141b25] px-2 py-1 text-left text-[12px] text-slate-300 hover:border-sky-700">
                <span className="mr-2 font-mono text-[11px] text-sky-400">{r.Question_ID}</span>
                {(r.Example ?? "").slice(0, 130)}
              </button>
            ))}
          </div>
        </Card>
      )}
      <QuestionDrawer id={qid} onClose={() => setQid(null)} />
    </div>
  );
}
