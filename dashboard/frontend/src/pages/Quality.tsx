import { useEffect, useState } from "react";
import { api } from "../api";
import { Card, Stat, Loading, Err } from "../components/ui";

export default function Quality() {
  const [d, setD] = useState<{ checks: any[]; summary_text: string } | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api.dataQuality().then(setD).catch((e) => setErr(String(e)));
  }, []);
  if (err) return <Err message={err} />;
  if (!d) return <Loading />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">Data Quality</h1>
        <p className="text-[12px] text-slate-500">
          Validation results as documented in <span className="font-mono">stage2_summary.txt</span> — shown verbatim, not reinterpreted.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {d.checks.map((c) => (
          <Stat
            key={c.subject}
            label={c.subject}
            value={c.rows.toLocaleString()}
            sub={`unique IDs ${c.unique_ids ? "✓" : "✗"} · empty ${c.empty_critical} · image ${c.image} · generic ${c.generic}`}
          />
        ))}
      </div>
      <Card title="stage2_summary.txt — verbatim">
        <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-slate-300">{d.summary_text}</pre>
      </Card>
    </div>
  );
}
