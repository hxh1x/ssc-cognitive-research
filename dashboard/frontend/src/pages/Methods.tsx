import { useCallback, useEffect, useState } from "react";
import { api, SUBJECTS } from "../api";
import { useFilters } from "../filters";
import { Card, Field, inputCls, Loading, Err } from "../components/ui";
import { QuestionDrawer } from "../components/QuestionDrawer";

interface MRow {
  standard: string; fast: string; option: string; time: string;
  subjects: string[]; topics: string[]; archetypes: string[];
  archetype_count: number; count: number; example: string; example_id: string;
}

export default function Methods() {
  const { f, set } = useFilters();
  const [rows, setRows] = useState<MRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [qid, setQid] = useState<string | null>(null);
  const [debQ, setDebQ] = useState("");

  const fetchRows = useCallback(() => {
    setLoading(true); setErr("");
    api.methods({
      subject: f.subject === "all" ? "all" : f.subject,
      topic: f.topic, archetype: f.archetype, q: debQ,
    })
      .then((d) => setRows(d.slice(0, 120)))
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, [f.subject, f.topic, f.archetype, debQ]);
  useEffect(fetchRows, [fetchRows]);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">Methods</h1>
        <p className="text-[12px] text-slate-500">
          Method descriptions from the dataset — not experimentally validated optimality. Nothing here is labeled “best”.
        </p>
      </div>
      <Card>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
          <Field label="Subject">
            <select value={f.subject} onChange={(e) => set({ subject: e.target.value, topic: "", archetype: "" })} className={inputCls}>
              <option value="all">All subjects</option>
              {SUBJECTS.map((s) => <option key={s.key} value={s.key}>{s.short}</option>)}
            </select>
          </Field>
          <Field label="Topic (exact)">
            <input value={f.topic} onChange={(e) => set({ topic: e.target.value })} className={inputCls} placeholder="filter…" />
          </Field>
          <Field label="Archetype (exact)">
            <input value={f.archetype} onChange={(e) => set({ archetype: e.target.value })} className={inputCls} placeholder="filter…" />
          </Field>
          <Field label="Search methods">
            <input value={debQ} onChange={(e) => setDebQ(e.target.value)} className={inputCls} placeholder="text…" />
          </Field>
        </div>
      </Card>
      {err && <Err message={err} />}
      {loading && <Loading />}
      <div className="space-y-2.5">
        {rows.map((m, i) => (
          <Card key={i}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div><div className="text-[10.5px] uppercase tracking-wider text-slate-500">Standard</div><p className="text-[12.5px] text-slate-200">{m.standard}</p></div>
              <div><div className="text-[10.5px] uppercase tracking-wider text-slate-500">Fast</div><p className="text-[12.5px] text-slate-200">{m.fast}</p></div>
              <div><div className="text-[10.5px] uppercase tracking-wider text-slate-500">Option</div><p className="text-[12.5px] text-slate-200">{m.option}</p></div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
              <span className="tabular-nums text-sky-300">{m.count.toLocaleString()} questions</span>
              <span>{m.time}</span>
              <span>{m.subjects.join(", ")}</span>
              <span className="truncate">{m.archetype_count} archetypes</span>
              {m.example_id && (
                <button onClick={() => setQid(m.example_id)} className="text-sky-400 hover:text-sky-300">
                  e.g. {m.example_id}
                </button>
              )}
            </div>
          </Card>
        ))}
        {!rows.length && !loading && <p className="py-6 text-center text-slate-500">No methods match.</p>}
      </div>
      <QuestionDrawer id={qid} onClose={() => setQid(null)} />
    </div>
  );
}
