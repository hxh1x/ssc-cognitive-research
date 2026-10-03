import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useFilters } from "../filters";
import { Card, Stat, HBar, Heatmap, Loading, Err } from "../components/ui";
import { VBar, Trend } from "../components/charts";

export default function Subject() {
  const { key = "quant" } = useParams();
  const { set } = useFilters();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    setD(null); setErr("");
    api.subject(key).then(setD).catch((e) => setErr(String(e)));
  }, [key]);

  if (err) return <Err message={err} />;
  if (!d) return <Loading />;
  const goTopic = (t: string) => set({ subject: key, topic: t });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">{d.name}</h1>
        <p className="text-[12px] text-slate-500">Descriptive view of {d.total.toLocaleString()} classified questions.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Stat label="Questions" value={d.total.toLocaleString()} />
        <Stat label="Topics" value={d.topics.length} />
        <Stat label="Specific tags" value={(d.total - d.generic).toLocaleString()} sub={`${(100 * (d.total - d.generic) / d.total).toFixed(1)}%`} />
        <Stat label="Generic" value={d.generic.toLocaleString()} />
        <Stat label="Image-based" value={d.image.toLocaleString()} />
        <Stat label={key === "ga" ? "Subtopics" : "Archetypes"} value={(d.archetype_count ?? d.subtopics?.length ?? 0).toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card title="Questions by topic" sub="Click a topic to drill down">
          <HBar items={d.topics} maxItems={20} onClick={(t) => goTopic(t)} />
          <div className="mt-2 text-[11.5px] text-slate-500">
            Tip: clicking sets the global topic filter — then open <Link className="text-sky-400" to="/questions">Questions</Link> or{" "}
            <Link className="text-sky-400" to={`/topic/${key}/${encodeURIComponent(d.topics[0]?.name ?? "")}`}>Topic detail</Link>.
          </div>
        </Card>
        <Card title="Questions by year" sub="Dataset counts per year">
          <Trend data={d.by_year} />
        </Card>
      </div>

      <Card title="Topic × year" sub="Cell counts; click a cell to filter questions">
        <Heatmap
          rows={d.topics.map((t: any) => t.name)}
          cols={d.years}
          get={(r, c) => d.topic_year[r]?.find((x: any) => x.year === c)?.count ?? 0}
        />
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card title="Question forms"><HBar items={d.forms} /></Card>
        <Card title="Difficulty"><HBar items={d.difficulty} barColor="#818cf8" /></Card>
        <Card title="Estimated time"><HBar items={d.time} barColor="#34d399" /></Card>
        <Card title="Language difficulty"><HBar items={d.language} /></Card>
        <Card title="Recognition difficulty"><HBar items={d.recognition} barColor="#fbbf24" /></Card>
        {d.calc ? (
          <Card title="Calculation load"><HBar items={d.calc} barColor="#f472b6" /></Card>
        ) : (
          <Card title="Subject mix note">
            <p className="text-[12px] text-slate-400">
              {key === "ga"
                ? "GA uses Domain → Subtopic → Fact_Type → Form → Entity → Relationship → Distractor instead of archetypes."
                : "Calculation load is recorded for Quant only."}
            </p>
          </Card>
        )}
      </div>

      {key === "ga" && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Card title="Subtopics"><HBar items={d.subtopics} maxItems={20} /></Card>
          <Card title="Fact types"><HBar items={d.fact_types} barColor="#818cf8" /></Card>
          <Card title="Distractor types"><HBar items={d.distractors} barColor="#fbbf24" /></Card>
          <Card title="Entity types"><HBar items={d.entities} maxItems={14} /></Card>
          <Card title="Relationships"><HBar items={d.relationships} maxItems={14} barColor="#34d399" /></Card>
          <Card title="Static vs Current"><HBar items={d.static_current} barColor="#f472b6" /></Card>
        </div>
      )}

      <Card title="All topics" sub="Full ranking by observed count (descriptive, not importance)">
        <VBar data={d.topics} height={240} />
      </Card>
    </div>
  );
}
