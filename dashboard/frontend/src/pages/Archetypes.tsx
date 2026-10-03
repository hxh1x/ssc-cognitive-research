import { useCallback, useEffect, useState } from "react";
import { api, SUBJECTS } from "../api";
import type { ArchItem } from "../api";
import { useFilters } from "../filters";
import { Card, Field, inputCls, Pagination, Loading, Err, Drawer, KV } from "../components/ui";
import { QuestionDrawer } from "../components/QuestionDrawer";

export default function Archetypes() {
  const { f, set } = useFilters();
  const [items, setItems] = useState<ArchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<ArchItem | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [qid, setQid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [debQ, setDebQ] = useState("");

  useEffect(() => { setPage(1); }, [f.subject, f.topic, f.year]);

  const fetchItems = useCallback(() => {
    setLoading(true); setErr("");
    api.archetypes({ subject: f.subject === "all" ? "all" : f.subject, topic: f.topic, year: f.year, q: debQ, page, per_page: 20 })
      .then((d) => { setItems(d.items); setTotal(d.total); })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, [f.subject, f.topic, f.year, debQ, page]);
  useEffect(fetchItems, [fetchItems]);

  const openDetail = (a: ArchItem) => {
    setOpen(a); setIds([]);
    api.archetypeDetail(a.subject, a.name).then((d) => setIds(d.question_ids)).catch(() => {});
  };

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">Archetypes / Patterns</h1>
        <p className="text-[12px] text-slate-500">
          Reusable question templates from Stage 2, ranked by observed frequency. GA rows use fact-structure classifications.
        </p>
      </div>
      <Card>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
          <Field label="Subject">
            <select value={f.subject} onChange={(e) => set({ subject: e.target.value, topic: "" })} className={inputCls}>
              <option value="all">All subjects</option>
              {SUBJECTS.map((s) => <option key={s.key} value={s.key}>{s.short}</option>)}
            </select>
          </Field>
          <Field label="Year"><input value={f.year} onChange={(e) => set({ year: e.target.value })} placeholder="e.g. 2024" className={inputCls} /></Field>
          <Field label="Topic contains">
            <input value={f.topic} onChange={(e) => set({ topic: e.target.value })} placeholder="filter…" className={inputCls} />
          </Field>
          <Field label="Search archetypes">
            <input value={debQ} onChange={(e) => setDebQ(e.target.value)} placeholder="name, trigger, example…" className={inputCls} />
          </Field>
          <div className="flex items-end"><Pagination total={total} page={page} perPage={20} onPage={setPage} /></div>
        </div>
      </Card>

      {err && <Err message={err} />}
      {loading && <Loading />}
      <div className="space-y-2.5">
        {items.map((a) => (
          <Card key={a.subject + "::" + a.name}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-slate-100">{a.name}</div>
                <div className="mt-0.5 text-[11.5px] text-slate-500">
                  {a.subject} · {a.topic} · {a.count.toLocaleString()} questions · {a.years.join(", ")} · {a.shifts} shifts · {a.estimated_time}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[12.5px] text-slate-400">{a.example}</p>
              </div>
              <button onClick={() => openDetail(a)} className="shrink-0 rounded-md border border-[#26303e] px-3 py-1.5 text-[12px] text-sky-300 hover:border-sky-600">
                Expand
              </button>
            </div>
          </Card>
        ))}
        {!items.length && !loading && <p className="py-6 text-center text-slate-500">No archetypes match.</p>}
      </div>
      <Pagination total={total} page={page} perPage={20} onPage={setPage} />

      {open && (
        <Drawer title={open.name} onClose={() => setOpen(null)} wide>
          <dl>
            <KV k="Subject / topic" v={`${open.subject} / ${open.topic}`} />
            <KV k="Frequency" v={`${open.count.toLocaleString()} questions`} mono />
            <KV k="Years" v={open.years.join(", ")} mono />
            <KV k="Shifts" v={String(open.shifts)} mono />
            <KV k="Micro-concept" v={open.micro_concept} />
            <KV k="Subtopic" v={open.subtopic} />
            <KV k="Trap" v={open.trap} />
            <KV k="Standard method" v={open.standard_method} />
            <KV k="Fast method" v={open.fast_method} />
            <KV k="Option method" v={open.option_method} />
            <KV k="Prerequisite" v={open.prerequisite} />
            <KV k="Estimated time" v={open.estimated_time} mono />
            <KV k="Typical difficulty" v={open.difficulty} />
            <KV k="Example" v={open.example} />
          </dl>
          <h3 className="mb-1 mt-4 text-[12.5px] font-semibold text-slate-200">
            All {ids.length.toLocaleString()} assigned questions (click to open)
          </h3>
          <div className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">
            {ids.map((id) => (
              <button key={id} onClick={() => setQid(id)}
                className="rounded border border-[#26303e] px-2 py-0.5 font-mono text-[11px] text-sky-300 hover:border-sky-600">
                {id}
              </button>
            ))}
          </div>
        </Drawer>
      )}
      <QuestionDrawer id={qid} onClose={() => setQid(null)} />
    </div>
  );
}
