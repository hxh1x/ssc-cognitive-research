import { useEffect, useState } from "react";
import { api } from "../api";
import type { QRow } from "../api";
import { Drawer, KV, Loading, Err } from "./ui";

export function QuestionDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [row, setRow] = useState<QRow | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!id) return;
    setRow(null); setErr("");
    api.question(id).then(setRow).catch((e) => setErr(String(e)));
  }, [id]);
  if (!id) return null;
  const r = row;
  const topic = r?.Topic ?? r?.Domain ?? "";
  const arch = r?.Question_Archetype ?? "";
  return (
    <Drawer title={id} onClose={onClose} wide>
      {!r && !err && <Loading />}
      {err && <Err message={err} />}
      {r && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#26303e] bg-[#0b0e13] p-3.5">
            <div className="mb-1 text-[10.5px] uppercase tracking-wider text-slate-500">Original question text</div>
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-100">{r.Example}</p>
            {r.options && (r.options.a || r.options.b || r.options.c || r.options.d) && (
              <div className="mt-3 space-y-1.5 border-t border-[#1c2430] pt-2.5">
                {(["a", "b", "c", "d"] as const).map((k) => (
                  r.options![k] ? (
                    <div key={k} className="flex gap-2 text-[12.5px]">
                      <span className="shrink-0 font-mono text-sky-400">({k})</span>
                      <span className="text-slate-300">{r.options![k]}</span>
                    </div>
                  ) : null
                ))}
              </div>
            )}
            {r.Example.includes("image/figure-based") && (
              <p className="mt-2 text-[12px] text-amber-300/90">[Image/figure-based content — see original PDF. The figure is not available in this dataset.]</p>
            )}
          </div>
          <dl>
            <KV k="Year" v={r.Year} mono />
            <KV k="Shift" v={r.Shift} mono />
            <KV k="Subject" v={r.Subject} />
            <KV k="Topic" v={topic} />
            <KV k="Subtopic" v={r.Subtopic} />
            <KV k="Micro-concept" v={r.Micro_Concept} />
            <KV k={r._subject === "ga" ? "Pattern" : "Archetype"} v={arch || ("Fact: " + (r.Fact_Type ?? ""))} />
            <KV k="Question form" v={r.Question_Form} />
            <KV k="Difficulty" v={r.Difficulty} />
            <KV k="Language difficulty" v={r.Language_Difficulty} />
            <KV k="Recognition difficulty" v={r.Recognition_Difficulty} />
            {r.Calculation_Load && <KV k="Calculation load" v={r.Calculation_Load} />}
            <KV k="Estimated time" v={r.Estimated_Time} mono />
            <KV k="Trap" v={r.Trap} />
            <KV k="Standard method" v={r.Standard_Method} />
            <KV k="Fast method" v={r.Fast_Method} />
            <KV k="Option method" v={r.Option_Method} />
            <KV k="Prerequisite" v={r.Prerequisite_Concept} />
            {r.Entity_Type && <KV k="Entity type" v={r.Entity_Type} />}
            {r.Relationship_Type && <KV k="Relationship" v={r.Relationship_Type} />}
            {r.Distractor_Type && <KV k="Distractor type" v={r.Distractor_Type} />}
            {r.Static_Current && <KV k="Static / Current" v={r.Static_Current} />}
          </dl>
        </div>
      )}
    </Drawer>
  );
}
