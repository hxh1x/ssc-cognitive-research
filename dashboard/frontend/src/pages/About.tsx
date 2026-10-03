import { Card } from "../components/ui";

export default function About() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-100">About Dataset</h1>
      </div>
      <Card title="What this dashboard is">
        <div className="space-y-2 text-[13px] leading-relaxed text-slate-300">
          <p>
            This dashboard visualizes an existing SSC CGL Tier-1 PYQ evidence layer containing{" "}
            <strong className="text-slate-100">8,800 questions from 88 papers</strong> (2023–2025):
            2,200 each of Quantitative Aptitude, English Comprehension, General Intelligence and
            Reasoning, and General Awareness.
          </p>
          <p>
            Every question carries its Stage 2 classification: topic, subtopic, micro-concept,
            archetype or fact-pattern, question form, difficulty fields, traps, methods, estimated
            time, prerequisites, year and shift — with the original question text and options
            preserved verbatim.
          </p>
        </div>
      </Card>
      <Card title="What this dashboard does not do">
        <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-slate-300">
          <li>It does not predict SSC CGL 2027 or any future paper.</li>
          <li>It does not rank topics by subjective importance — counts are descriptive history.</li>
          <li>It does not determine what will appear in the future.</li>
          <li>Difficulty, calculation load, language/recognition difficulty and estimated-time fields are heuristic estimates, not measurements.</li>
          <li>Traps and error-focus labels are heuristic cues from question text, not answer-key-derived truth.</li>
          <li>Image-based rows reference the original PDFs; figures are not embedded.</li>
        </ul>
      </Card>
      <Card title="Sources">
        <ul className="list-disc space-y-1 pl-5 font-mono text-[12px] text-slate-400">
          <li>cgl_quant_pattern_db.csv + cgl_quant_archetypes.txt</li>
          <li>cgl_english_pattern_db.csv + cgl_english_archetypes.txt</li>
          <li>cgl_reasoning_pattern_db.csv + cgl_reasoning_archetypes.txt</li>
          <li>cgl_awareness_pattern_db.csv + cgl_awareness_patterns.txt</li>
          <li>stage2_summary.txt (validation results, shown verbatim on the Data Quality page)</li>
        </ul>
        <p className="mt-2 text-[12px] text-slate-500">The application is read-only and never modifies these files.</p>
      </Card>
    </div>
  );
}
