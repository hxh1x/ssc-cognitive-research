import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useFilters } from "../filters";
import { Card, Stat, HBar, Heatmap, Loading, Err } from "../components/ui";

export default function Topic() {
  const { subject = "quant", name = "" } = useParams();
  const topic = decodeURIComponent(name);
  const { set } = useFilters();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    setD(null); setErr("");
    api.topicDetail(subject, topic).then(setD).catch((e) => setErr(String(e)));
  }, [subject, topic]);
  if (err) return <Err message={err} />;
  if (!d) return <Loading />;
  if (d.error) return <Err message="Topic not found" />;

  const openQ = (patch: Record<string, string>) =>
    set({ subject, topic, subtopic: "", micro: "", archetype: "", ...patch });

  return (
    <div className="space-y-4">
      <div className="text-[11.5px] text-slate-500">
        <Link to={`/subject/${subject}`} className="text-sky-400">← Subject</Link>
      </div>
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">{d.topic}</h1>
        <p className="text-[12px] text-slate-500">{d.count.toLocaleString()} questions · {subject}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Questions" value={d.count.toLocaleString()} />
        <Stat label="Subtopics" value={d.subtopics.length} />
        <Stat label="Archetypes / patterns" value={d.archetypes.length} />
        <Stat label="Image-based" value={d.image.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card title="Archetypes / patterns in this topic" sub="Click to filter questions">
          <HBar items={d.archetypes} maxItems={30} onClick={(a) => openQ({ archetype: a })} />
        </Card>
        <div className="space-y-3">
          <Card title="Subtopics" sub="Click to filter questions">
            <HBar items={d.subtopics} maxItems={15} onClick={(s) => openQ({ subtopic: s })} />
          </Card>
          <Card title="Micro-concepts" sub="Click to filter questions">
            <HBar items={d.micro_concepts} maxItems={15} onClick={(m) => openQ({ micro: m })} />
          </Card>
        </div>
      </div>

      <Card title="Year distribution">
        <Heatmap rows={[d.topic]} cols={d.by_year.map((x: any) => x.year)} get={(_, c) => d.by_year.find((x: any) => x.year === c)?.count ?? 0} />
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card title="Question forms"><HBar items={d.forms} /></Card>
        <Card title="Difficulty"><HBar items={d.difficulty} barColor="#818cf8" /></Card>
        <Card title="Estimated time"><HBar items={d.time} barColor="#34d399" /></Card>
      </div>

      <Card title="Traps in this topic" sub="Heuristic labels from Stage 2 — click to see questions">
        <HBar items={d.traps.filter((t: any) => t.name && t.name !== "—")} maxItems={20} barColor="#fbbf24" />
      </Card>

      <div>
        <Link
          to="/questions"
          onClick={() => openQ({})}
          className="inline-block rounded-md border border-sky-600 bg-sky-500/10 px-4 py-2 text-[13px] text-sky-300 hover:bg-sky-500/20"
        >
          View all {d.count.toLocaleString()} questions in this topic →
        </Link>
      </div>
    </div>
  );
}
