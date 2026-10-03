import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Overview as OV } from "../api";
import { Card, Stat, HBar, Loading, Err } from "../components/ui";
import { Trend, Donut, LegendChips } from "../components/charts";

export default function Overview() {
  const [d, setD] = useState<OV | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api.overview().then(setD).catch((e) => setErr(String(e)));
  }, []);
  if (err) return <Err message={err} retry={() => window.location.reload()} />;
  if (!d) return <Loading label="Loading evidence layer…" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">Overview</h1>
        <p className="text-[12px] text-slate-500">
          Descriptive statistics of the frozen Stage 2 evidence layer. No predictions, no priority labels.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total questions" value={d.total.toLocaleString()} sub="88 papers · 2023–2025" />
        {d.subjects.map((s) => (
          <Link key={s.key} to={`/subject/${s.key}`}>
            <Stat label={s.short} value={s.total.toLocaleString()} sub={`${s.topics} topics · ${s.archetypes} archetypes`} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card title="Questions by year" sub="All subjects combined">
          <Trend data={d.by_year} />
        </Card>
        <Card title="Subject mix" sub="2,200 each (exact)">
          <Donut data={d.subjects.map((s) => ({ name: s.short, count: s.total }))} />
          <LegendChips data={d.subjects.map((s) => ({ name: s.short, count: s.total }))} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {d.subjects.map((s) => (
          <Card
            key={s.key}
            title={`${s.short} — topic counts`}
            sub={`${s.topics} topics · ${s.specific.toLocaleString()} specific · ${s.generic.toLocaleString()} generic · ${s.image.toLocaleString()} image-based`}
            right={<Link to={`/subject/${s.key}`} className="text-[12px] text-sky-400 hover:text-sky-300">Open dashboard →</Link>}
          >
            <TopicBars subject={s.key} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function TopicBars({ subject }: { subject: string }) {
  const [items, setItems] = useState<{ subject: string; topic: string; count: number }[]>([]);
  useEffect(() => {
    api.topics(subject).then(setItems).catch(() => {});
  }, [subject]);
  return <HBar items={items.map((t) => ({ name: t.topic, count: t.count }))} maxItems={10} />;
}
