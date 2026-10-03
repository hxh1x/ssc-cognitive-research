import { useCallback, useEffect, useState } from "react";
import { api, SUBJECTS, topicOf, archOf } from "../api";
import type { QRow } from "../api";
import { useFilters, EMPTY_FILTERS } from "../filters";
import { Card, Field, Select, inputCls, Pagination, Loading, Err } from "../components/ui";
import { QuestionDrawer } from "../components/QuestionDrawer";

export default function Questions() {
  const { f, set, clear } = useFilters();
  const [opts, setOpts] = useState<Record<string, string[]>>({});
  const [rows, setRows] = useState<QRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [sort, setSort] = useState("id");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [debQ, setDebQ] = useState(f.q);

  useEffect(() => {
    const t = setTimeout(() => set({ q: debQ, }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debQ]);

  useEffect(() => { setDebQ(f.q); }, [f.q]);
  useEffect(() => { setPage(1); }, [f]);

  const fetchOpts = useCallback(() => {
    api.filterOptions(f.subject === "all" ? "all" : f.subject).then(setOpts).catch(() => {});
  }, [f.subject]);
  useEffect(fetchOpts, [fetchOpts]);

  const fetchRows = useCallback(() => {
    setLoading(true); setErr("");
    api.questions({
      subject: f.subject === "all" ? "all" : f.subject,
      year: f.year, shift: f.shift, topic: f.topic, subtopic: f.subtopic,
      micro: f.micro, archetype: f.archetype, form: f.form,
      difficulty: f.difficulty, language: f.language, recognition: f.recognition,
      calc: f.calc, image: f.image, q: f.q, sort, page, per_page: perPage,
    })
      .then((d) => { setRows(d.items); setTotal(d.total); })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, [f, sort, page, perPage]);
  useEffect(fetchRows, [fetchRows]);

  const exportCsv = () => {
    api.questions({
      subject: f.subject === "all" ? "all" : f.subject,
      year: f.year, shift: f.shift, topic: f.topic, subtopic: f.subtopic,
      micro: f.micro, archetype: f.archetype, form: f.form,
      difficulty: f.difficulty, language: f.language, recognition: f.recognition,
      calc: f.calc, image: f.image, q: f.q, sort, page: 1, per_page: 100,
    }).then((d) => {
      if (!d.items.length) return;
      const cols = Object.keys(d.items[0]).filter((k) => !k.startsWith("_") && k !== "options");
      const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv = [cols.join(","), ...d.items.map((r) => cols.map((c) => esc((r as any)[c])).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cgl_filtered_export.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  };

  const S = (label: string, k: keyof typeof EMPTY_FILTERS, o: string[]) => (
    <Field label={label}>
      <Select value={(f as any)[k]} onChange={(v) => set({ [k]: v } as any)} options={o} />
    </Field>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-slate-100">Questions Explorer</h1>
          <p className="text-[12px] text-slate-500">Filters persist across pages. Original wording preserved verbatim.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={clear} className="rounded-md border border-[#26303e] px-3 py-1.5 text-[12px] text-slate-300">Clear all filters</button>
          <button onClick={exportCsv} className="rounded-md border border-sky-700 bg-sky-500/10 px-3 py-1.5 text-[12px] text-sky-300">Export page CSV</button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-7">
          <Field label="Subject">
            <select value={f.subject} onChange={(e) => set({ subject: e.target.value, topic: "", subtopic: "", micro: "", archetype: "" })} className={inputCls}>
              <option value="all">All subjects</option>
              {SUBJECTS.map((s) => <option key={s.key} value={s.key}>{s.short}</option>)}
            </select>
          </Field>
          {S("Year", "year", opts.Year ?? [])}
          {S("Topic", "topic", opts.Topic ?? [])}
          {S("Subtopic", "subtopic", opts.Subtopic ?? [])}
          {S("Micro-concept", "micro", opts.Micro_Concept ?? [])}
          {S("Archetype", "archetype", opts.Archetype ?? [])}
          {S("Form", "form", opts.Question_Form ?? [])}
          {S("Difficulty", "difficulty", opts.Difficulty ?? [])}
          {S("Language", "language", opts.Language_Difficulty ?? [])}
          {S("Recognition", "recognition", opts.Recognition_Difficulty ?? [])}
          {S("Calc load", "calc", opts.Calculation_Load ?? [])}
          <Field label="Image">
            <select value={f.image} onChange={(e) => set({ image: e.target.value })} className={inputCls}>
              <option value="">All</option>
              <option value="only">Image-based only</option>
              <option value="exclude">Exclude image-based</option>
            </select>
          </Field>
          <Field label="Shift">
            <Select value={f.shift} onChange={(v) => set({ shift: v })} options={opts.Shift ?? []} />
          </Field>
          <Field label="Text search">
            <input value={debQ} onChange={(e) => setDebQ(e.target.value)} placeholder="ID, text, trap…" className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card
        right={<Pagination total={total} page={page} perPage={perPage} onPage={setPage} />}
        title={`${total.toLocaleString()} matching questions`}
        sub={`sort: ${sort}`}
      >
        {err && <Err message={err} />}
        {loading && <Loading />}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-[#26303e] text-left text-slate-500">
                  {["ID", "Year", "Shift", "Subject", "Topic", "Archetype", "Form", "Diff", "Time"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-2 py-1.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.Question_ID} onClick={() => setOpenId(r.Question_ID)}
                    className="cursor-pointer border-b border-[#141b25] hover:bg-[#131a24]">
                    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[11.5px] text-sky-300">{r.Question_ID}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 tabular-nums">{r.Year}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-400">{r.Shift}</td>
                    <td className="whitespace-nowrap px-2 py-1.5">{r._subject_short}</td>
                    <td className="max-w-[180px] truncate px-2 py-1.5" title={topicOf(r)}>{topicOf(r)}</td>
                    <td className="max-w-[220px] truncate px-2 py-1.5 text-slate-400" title={archOf(r)}>{archOf(r)}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-400">{r.Question_Form}</td>
                    <td className="whitespace-nowrap px-2 py-1.5">{r.Difficulty}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 tabular-nums text-slate-400">{r.Estimated_Time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && !loading && <p className="py-6 text-center text-slate-500">No questions match these filters.</p>}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <Pagination total={total} page={page} perPage={perPage} onPage={setPage} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-[#26303e] bg-[#0b0e13] px-2 py-1 text-[12px]">
            <option value="id">Sort: ID</option>
            <option value="year">Sort: Year</option>
            <option value="topic">Sort: Topic</option>
          </select>
        </div>
      </Card>
      <QuestionDrawer id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
