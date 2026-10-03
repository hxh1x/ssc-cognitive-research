const BASE = "";

export interface Page<T> {
  total: number;
  page: number;
  per_page: number;
  items: T[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export interface OverviewSubject {
  key: string; name: string; short: string; total: number;
  topics: number; archetypes: number; image: number;
  generic: number; specific: number;
}

export interface Overview {
  total: number;
  subjects: OverviewSubject[];
  by_year: { year: string; count: number }[];
  subject_year: Record<string, { year: string; count: number }[]>;
}

export interface QRow {
  Question_ID: string; Year: string; Shift: string; Subject: string;
  Topic?: string; Domain?: string; Subtopic: string; Micro_Concept: string;
  Question_Archetype?: string; Fact_Type?: string; Question_Form: string;
  Difficulty: string; Language_Difficulty: string; Recognition_Difficulty: string;
  Calculation_Load?: string; Trap: string; Standard_Method: string;
  Fast_Method: string; Option_Method: string; Estimated_Time: string;
  Prerequisite_Concept: string; Example: string;
  Entity_Type?: string; Relationship_Type?: string; Distractor_Type?: string;
  Static_Current?: string;
  _subject: string; _subject_short: string;
  options?: { a: string; b: string; c: string; d: string };
}

export interface ArchItem {
  subject: string; topic: string; name: string; count: number;
  years: string[]; shifts: number; micro_concept: string; subtopic: string;
  trap: string; standard_method: string; fast_method: string;
  option_method: string; prerequisite: string; estimated_time: string;
  difficulty: string; example: string; example_id: string;
}

export const api = {
  overview: () => get<Overview>("/api/overview"),
  subject: (s: string) => get<any>(`/api/subjects/${s}`),
  filterOptions: (s = "all") => get<Record<string, string[]>>(`/api/filter-options?subject=${s}`),
  questions: (p: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) qs.set(k, String(v));
    });
    return get<Page<QRow>>("/api/questions?" + qs.toString());
  },
  question: (id: string) => get<QRow>(`/api/questions/${id}`),
  topics: (s = "all") => get<{ subject: string; topic: string; count: number }[]>(`/api/topics?subject=${s}`),
  topicDetail: (s: string, t: string) => get<any>(`/api/topics/${s}/${encodeURIComponent(t)}`),
  archetypes: (p: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) qs.set(k, String(v));
    });
    return get<Page<ArchItem>>("/api/archetypes?" + qs.toString());
  },
  archetypeDetail: (s: string, n: string) =>
    get<{ detail: ArchItem | null; question_ids: string[] }>(`/api/archetypes/${s}/${encodeURIComponent(n)}`),
  traps: (p: Record<string, string>) => {
    const qs = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => { if (v) qs.set(k, v); });
    return get<any[]>("/api/traps?" + qs.toString());
  },
  methods: (p: Record<string, string>) => {
    const qs = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => { if (v) qs.set(k, v); });
    return get<any[]>("/api/methods?" + qs.toString());
  },
  yearShifts: (p: Record<string, string>) => {
    const qs = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => { if (v) qs.set(k, v); });
    return get<any[]>("/api/year-shifts?" + qs.toString());
  },
  dataQuality: () => get<{ checks: any[]; summary_text: string }>("/api/data-quality"),
};

export const SUBJECTS = [
  { key: "quant", short: "Quant", name: "Quantitative Aptitude" },
  { key: "english", short: "English", name: "English Comprehension" },
  { key: "reasoning", short: "Reasoning", name: "General Intelligence and Reasoning" },
  { key: "ga", short: "GA", name: "General Awareness" },
];

export function topicOf(r: QRow): string {
  return r.Topic ?? r.Domain ?? "";
}

export function archOf(r: QRow): string {
  return r.Question_Archetype ?? r.Subtopic ?? "";
}
