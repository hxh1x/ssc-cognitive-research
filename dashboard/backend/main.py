"""SSC CGL Stage 2 evidence dashboard — read-only FastAPI backend.

Reads the frozen Stage 2 CSVs from /home/harixx/cgl_pyqs/, caches in memory.
Never writes to the source files.
"""
import csv
import os
import re
from collections import Counter
from functools import lru_cache
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

DATA_DIR = os.environ.get(
    "CGL_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "..")
)
DATA_DIR = os.path.abspath(DATA_DIR)

SUBJECTS = {
    "quant": {
        "key": "quant",
        "name": "Quantitative Aptitude",
        "short": "Quant",
        "csv": "cgl_quant_pattern_db.csv",
        "id_prefix": "QNT-",
        "topic_col": "Topic",
        "arch_col": "Question_Archetype",
        "has_calc": True,
        "kind": "archetype",
    },
    "english": {
        "key": "english",
        "name": "English Comprehension",
        "short": "English",
        "csv": "cgl_english_pattern_db.csv",
        "id_prefix": "ENG-",
        "topic_col": "Topic",
        "arch_col": "Question_Archetype",
        "has_calc": False,
        "kind": "archetype",
    },
    "reasoning": {
        "key": "reasoning",
        "name": "General Intelligence and Reasoning",
        "short": "Reasoning",
        "csv": "cgl_reasoning_pattern_db.csv",
        "id_prefix": "REA-",
        "topic_col": "Topic",
        "arch_col": "Question_Archetype",
        "has_calc": False,
        "kind": "archetype",
    },
    "ga": {
        "key": "ga",
        "name": "General Awareness",
        "short": "GA",
        "csv": "cgl_awareness_pattern_db.csv",
        "id_prefix": "GA-",
        "topic_col": "Domain",
        "arch_col": "Subtopic",
        "has_calc": False,
        "kind": "pattern",
    },
}

SECTION_BY_NAME = {
    "Quantitative Aptitude": "quant",
    "English Comprehension": "english",
    "General Intelligence and Reasoning": "reasoning",
    "General Awareness": "ga",
}

app = FastAPI(title="SSC CGL Stage 2 Evidence Dashboard", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA: dict = {}
OPTIONS: dict = {}
BY_ID: dict = {}


def _read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_all():
    for key, meta in SUBJECTS.items():
        rows = _read_csv(os.path.join(DATA_DIR, meta["csv"]))
        DATA[key] = rows
        for i, r in enumerate(rows):
            BY_ID[r["Question_ID"]] = (key, i)
    # Options lookup from the structured dataset, positional per section.
    struct_path = os.path.join(DATA_DIR, "cgl_structured_data.csv")
    if os.path.exists(struct_path):
        struct = _read_csv(struct_path)
        per_section: dict = {}
        for r in struct:
            per_section.setdefault(r["Section"], []).append(r)
        for sec, lst in per_section.items():
            key = SECTION_BY_NAME.get(sec)
            if not key:
                continue
            for i, r in enumerate(lst):
                qid = "%s%04d" % (SUBJECTS[key]["id_prefix"], i + 1)
                OPTIONS[qid] = {
                    "a": r.get("Option_A", ""),
                    "b": r.get("Option_B", ""),
                    "c": r.get("Option_C", ""),
                    "d": r.get("Option_D", ""),
                }


load_all()


def row_is_image(r):
    return "image/figure-based" in (r.get("Example", ""))


def row_is_generic(r, meta):
    a = r.get(meta["arch_col"], "")
    return a.startswith("General ") or a.startswith("Unclassified")


def apply_filters(rows, meta, subject=None, year=None, shift=None, topic=None,
                  subtopic=None, micro=None, archetype=None, form=None,
                  difficulty=None, language=None, recognition=None,
                  calc=None, image=None, q=None):
    tcol, acol = meta["topic_col"], meta["arch_col"]
    out = []
    ql = q.lower() if q else None
    for r in rows:
        if year and r.get("Year") != year:
            continue
        if shift and r.get("Shift") != shift:
            continue
        if topic and r.get(tcol) != topic:
            continue
        if subtopic and r.get("Subtopic") != subtopic:
            continue
        if micro and r.get("Micro_Concept") != micro:
            continue
        if archetype and r.get(acol) != archetype:
            continue
        if form and r.get("Question_Form") != form:
            continue
        if difficulty and r.get("Difficulty") != difficulty:
            continue
        if language and r.get("Language_Difficulty") != language:
            continue
        if recognition and r.get("Recognition_Difficulty") != recognition:
            continue
        if calc and r.get("Calculation_Load") != calc:
            continue
        if image == "only" and not row_is_image(r):
            continue
        if image == "exclude" and row_is_image(r):
            continue
        if ql:
            hay = " ".join([
                r.get("Question_ID", ""), r.get("Example", ""),
                r.get(tcol, ""), r.get("Subtopic", ""),
                r.get("Micro_Concept", ""), r.get(acol, ""),
                r.get("Trap", ""), r.get("Standard_Method", ""),
                r.get("Fast_Method", ""), r.get("Option_Method", ""),
            ]).lower()
            if ql not in hay:
                continue
        out.append(r)
    return out


def count_by(rows, col):
    return [{"name": k or "(blank)", "count": v}
            for k, v in Counter(r.get(col, "") for r in rows).most_common()]


@app.get("/api/overview")
def overview():
    subjects = []
    by_year_total = Counter()
    subj_year = {}
    for key, meta in SUBJECTS.items():
        rows = DATA[key]
        by_year = Counter(r["Year"] for r in rows)
        for y, c in by_year.items():
            by_year_total[y] += c
        subj_year[key] = [{"year": y, "count": by_year[y]}
                          for y in sorted(by_year)]
        topics = count_by(rows, meta["topic_col"])
        img = sum(1 for r in rows if row_is_image(r))
        gen = sum(1 for r in rows if row_is_generic(r, meta))
        arch_n = len(set(r[meta["arch_col"]] for r in rows))
        subjects.append({
            "key": key, "name": meta["name"], "short": meta["short"],
            "total": len(rows), "topics": len(topics),
            "archetypes": arch_n, "image": img, "generic": gen,
            "specific": len(rows) - gen,
        })
    return {
        "total": sum(len(v) for v in DATA.values()),
        "subjects": subjects,
        "by_year": [{"year": y, "count": by_year_total[y]}
                    for y in sorted(by_year_total)],
        "subject_year": subj_year,
    }


@app.get("/api/subjects/{subject}")
def subject_dashboard(subject: str):
    meta = SUBJECTS[subject]
    rows = DATA[subject]
    tcol = meta["topic_col"]
    topic_year = {}
    for r in rows:
        topic_year.setdefault(r[tcol], Counter())[r["Year"]] += 1
    years = sorted(set(r["Year"] for r in rows))
    resp = {
        "key": subject, "name": meta["name"], "short": meta["short"],
        "total": len(rows),
        "topics": count_by(rows, tcol),
        "years": years,
        "by_year": [{"year": y, "count": c} for y, c in sorted(Counter(r["Year"] for r in rows).items())],
        "topic_year": {t: [{"year": y, "count": c.get(y, 0)} for y in years]
                       for t, c in topic_year.items()},
        "forms": count_by(rows, "Question_Form"),
        "difficulty": count_by(rows, "Difficulty"),
        "language": count_by(rows, "Language_Difficulty"),
        "recognition": count_by(rows, "Recognition_Difficulty"),
        "time": count_by(rows, "Estimated_Time"),
        "image": sum(1 for r in rows if row_is_image(r)),
        "generic": sum(1 for r in rows if row_is_generic(r, meta)),
    }
    if meta["has_calc"]:
        resp["calc"] = count_by(rows, "Calculation_Load")
    if subject == "ga":
        resp["subtopics"] = count_by(rows, "Subtopic")
        resp["fact_types"] = count_by(rows, "Fact_Type")
        resp["entities"] = count_by(rows, "Entity_Type")
        resp["relationships"] = count_by(rows, "Relationship_Type")
        resp["distractors"] = count_by(rows, "Distractor_Type")
        resp["static_current"] = count_by(rows, "Static_Current")
    else:
        resp["archetype_count"] = len(set(r[meta["arch_col"]] for r in rows))
    return resp


@app.get("/api/filter-options")
def filter_options(subject: str = Query("all")):
    keys = [subject] if subject in SUBJECTS else list(SUBJECTS)
    agg: dict = {}
    for key in keys:
        meta = SUBJECTS[key]
        rows = DATA[key]
        for col in ["Year", "Shift", meta["topic_col"], "Subtopic",
                    "Micro_Concept", meta["arch_col"], "Question_Form",
                    "Difficulty", "Language_Difficulty",
                    "Recognition_Difficulty", "Calculation_Load"]:
            agg.setdefault(col, set()).update(r.get(col, "") for r in rows)
    out = {k: sorted(v) for k, v in agg.items()}
    out["Topic"] = sorted(agg.get("Topic", set()) | agg.get("Domain", set()))
    out["Archetype"] = sorted(
        agg.get("Question_Archetype", set()) | agg.get("Subtopic", set()))
    return out


def _paginate(items, page, per_page):
    total = len(items)
    start = (page - 1) * per_page
    return {"total": total, "page": page, "per_page": per_page,
            "items": items[start:start + per_page]}


@app.get("/api/questions")
def list_questions(
    subject: str = Query("all"),
    year: Optional[str] = None,
    shift: Optional[str] = None,
    topic: Optional[str] = None,
    subtopic: Optional[str] = None,
    micro: Optional[str] = None,
    archetype: Optional[str] = None,
    form: Optional[str] = None,
    difficulty: Optional[str] = None,
    language: Optional[str] = None,
    recognition: Optional[str] = None,
    calc: Optional[str] = None,
    image: Optional[str] = None,
    q: Optional[str] = None,
    sort: str = "id",
    page: int = 1,
    per_page: int = 25,
):
    keys = [subject] if subject in SUBJECTS else list(SUBJECTS)
    per_page = max(1, min(per_page, 100))
    items = []
    for key in keys:
        meta = SUBJECTS[key]
        rows = apply_filters(DATA[key], meta, subject, year, shift, topic,
                             subtopic, micro, archetype, form, difficulty,
                             language, recognition, calc, image, q)
        for r in rows:
            d = dict(r)
            d["_subject"] = key
            d["_subject_short"] = meta["short"]
            items.append(d)
    if sort == "year":
        items.sort(key=lambda r: (r.get("Year", ""), r.get("Question_ID", "")))
    elif sort == "topic":
        tcol = "Topic"
        items.sort(key=lambda r: (r.get("Topic", r.get("Domain", "")),
                                  r.get("Question_ID", "")))
    else:
        items.sort(key=lambda r: r.get("Question_ID", ""))
    return _paginate(items, page, per_page)


@app.get("/api/questions/{question_id}")
def question_detail(question_id: str):
    found = BY_ID.get(question_id.upper())
    if not found:
        return {"error": "not found"}
    key, idx = found
    meta = SUBJECTS[key]
    r = dict(DATA[key][idx])
    r["_subject"] = key
    r["_subject_short"] = meta["short"]
    r["options"] = OPTIONS.get(question_id.upper(), {"a": "", "b": "", "c": "", "d": ""})
    return r


@app.get("/api/topics")
def list_topics(subject: str = Query("all")):
    keys = [subject] if subject in SUBJECTS else list(SUBJECTS)
    out = []
    for key in keys:
        meta = SUBJECTS[key]
        for t in count_by(DATA[key], meta["topic_col"]):
            out.append({"subject": key, "topic": t["name"], "count": t["count"]})
    out.sort(key=lambda x: -x["count"])
    return out


@app.get("/api/topics/{subject}/{topic}")
def topic_detail(subject: str, topic: str):
    meta = SUBJECTS[subject]
    rows = [r for r in DATA[subject] if r.get(meta["topic_col"]) == topic]
    if not rows:
        return {"error": "not found"}
    years = sorted(set(r["Year"] for r in rows))
    by_year = Counter(r["Year"] for r in rows)
    arch = Counter(r[meta["arch_col"]] for r in rows)
    return {
        "subject": subject, "topic": topic, "count": len(rows),
        "subtopics": count_by(rows, "Subtopic"),
        "micro_concepts": count_by(rows, "Micro_Concept"),
        "archetypes": [{"name": k, "count": v} for k, v in arch.most_common()],
        "by_year": [{"year": y, "count": by_year.get(y, 0)} for y in years],
        "forms": count_by(rows, "Question_Form"),
        "difficulty": count_by(rows, "Difficulty"),
        "traps": count_by(rows, "Trap"),
        "time": count_by(rows, "Estimated_Time"),
        "image": sum(1 for r in rows if row_is_image(r)),
    }


def _arch_groups(subject, topic=None, year=None, q=None):
    meta = SUBJECTS[subject]
    rows = DATA[subject]
    if topic:
        tl = topic.lower()
        rows = [r for r in rows if tl in (r.get(meta["topic_col"]) or "").lower()]
    if year:
        rows = [r for r in rows if r.get("Year") == year]
    groups: dict = {}
    for r in rows:
        groups.setdefault(r[meta["arch_col"]], []).append(r)
    out = []
    for name, rs in groups.items():
        first = rs[0]
        if q:
            ql = q.lower()
            if ql not in name.lower() and not any(
                    ql in (x.get("Example", "") + x.get("Trap", "")).lower()
                    for x in rs):
                continue
        out.append({
            "subject": subject,
            "topic": first.get(meta["topic_col"]),
            "name": name,
            "count": len(rs),
            "years": sorted(set(x["Year"] for x in rs)),
            "shifts": len(set(x["Shift"] for x in rs)),
            "micro_concept": first.get("Micro_Concept", ""),
            "subtopic": first.get("Subtopic", ""),
            "trap": first.get("Trap", ""),
            "standard_method": first.get("Standard_Method", ""),
            "fast_method": first.get("Fast_Method", ""),
            "option_method": first.get("Option_Method", ""),
            "prerequisite": first.get("Prerequisite_Concept", ""),
            "estimated_time": first.get("Estimated_Time", ""),
            "difficulty": Counter(x.get("Difficulty", "") for x in rs).most_common(1)[0][0] if rs else "",
            "example": first.get("Example", ""),
            "example_id": first.get("Question_ID", ""),
        })
    out.sort(key=lambda x: -x["count"])
    return out


@app.get("/api/archetypes")
def list_archetypes(
    subject: str = Query("all"),
    topic: Optional[str] = None,
    year: Optional[str] = None,
    q: Optional[str] = None,
    page: int = 1,
    per_page: int = 25,
):
    keys = [subject] if subject in SUBJECTS else list(SUBJECTS)
    per_page = max(1, min(per_page, 100))
    items = []
    for key in keys:
        items.extend(_arch_groups(key, topic, year, q))
    items.sort(key=lambda x: -x["count"])
    return _paginate(items, page, per_page)


@app.get("/api/archetypes/{subject}/{name}")
def archetype_detail(subject: str, name: str):
    meta = SUBJECTS[subject]
    rs = [r for r in DATA[subject] if r.get(meta["arch_col"]) == name]
    if not rs:
        return {"error": "not found"}
    info = _arch_groups(subject)
    detail = next((x for x in info if x["name"] == name), None)
    return {"detail": detail,
            "question_ids": [r["Question_ID"] for r in rs]}


@app.get("/api/traps")
def list_traps(subject: str = Query("all"), topic: Optional[str] = None,
               q: Optional[str] = None):
    keys = [subject] if subject in SUBJECTS else list(SUBJECTS)
    out = []
    for key in keys:
        meta = SUBJECTS[key]
        groups: dict = {}
        for r in DATA[key]:
            if topic and r.get(meta["topic_col"]) != topic:
                continue
            t = (r.get("Trap", "") or "").strip()
            if not t or t == "—":
                continue
            groups.setdefault(t, []).append(r)
        for t, rs in groups.items():
            if q and q.lower() not in t.lower():
                continue
            topics = Counter(x[meta["topic_col"]] for x in rs)
            out.append({
                "subject": key, "trap": t, "count": len(rs),
                "topics": [{"name": k, "count": v} for k, v in topics.most_common(3)],
                "example": rs[0].get("Example", "")[:200],
                "example_id": rs[0].get("Question_ID", ""),
            })
    out.sort(key=lambda x: -x["count"])
    return out


@app.get("/api/methods")
def list_methods(subject: str = Query("all"), topic: Optional[str] = None,
                 archetype: Optional[str] = None, q: Optional[str] = None):
    keys = [subject] if subject in SUBJECTS else list(SUBJECTS)
    seen = {}
    for key in keys:
        meta = SUBJECTS[key]
        for r in DATA[key]:
            if topic and r.get(meta["topic_col"]) != topic:
                continue
            if archetype and r.get(meta["arch_col"]) != archetype:
                continue
            k = (r.get("Standard_Method", ""), r.get("Fast_Method", ""),
                 r.get("Option_Method", ""), r.get("Estimated_Time", ""))
            if not k[0]:
                continue
            e = seen.setdefault(k, {"subjects": set(), "topics": set(),
                                    "archetypes": set(), "count": 0,
                                    "example": r.get("Example", "")[:200],
                                    "example_id": r.get("Question_ID", "")})
            e["subjects"].add(key)
            e["topics"].add(r.get(meta["topic_col"], ""))
            e["archetypes"].add(r.get(meta["arch_col"], ""))
            e["count"] += 1
    out = [{"standard": k[0], "fast": k[1], "option": k[2], "time": k[3],
            "subjects": sorted(v["subjects"]), "topics": sorted(v["topics"]),
            "archetypes": sorted(v["archetypes"])[:5],
            "archetype_count": len(v["archetypes"]), "count": v["count"],
            "example": v["example"], "example_id": v["example_id"]}
           for k, v in seen.items()]
    if q:
        ql = q.lower()
        out = [x for x in out if ql in (x["standard"] + x["fast"]).lower()]
    out.sort(key=lambda x: -x["count"])
    return out


@app.get("/api/year-shifts")
def year_shifts(year: Optional[str] = None, shift: Optional[str] = None,
                subject: Optional[str] = None):
    tree: dict = {}
    for key, meta in SUBJECTS.items():
        if subject and subject != "all" and key != subject:
            continue
        for r in DATA[key]:
            if year and r.get("Year") != year:
                continue
            if shift and r.get("Shift") != shift:
                continue
            y = r.get("Year", "")
            s = r.get("Shift", "")
            tree.setdefault(y, {}).setdefault(s, {}).setdefault(key, 0)
            tree[y][s][key] += 1
    return [{"year": y,
             "shifts": [{"shift": s, "subjects": subs, "total": sum(subs.values())}
                        for s, subs in sorted(ss.items())]}
            for y, ss in sorted(tree.items())]


@app.get("/api/data-quality")
def data_quality():
    checks = []
    for key, meta in SUBJECTS.items():
        rows = DATA[key]
        ids = [r["Question_ID"] for r in rows]
        img = sum(1 for r in rows if row_is_image(r))
        gen = sum(1 for r in rows if row_is_generic(r, meta))
        empty = sum(1 for r in rows
                    if not r.get("Question_ID", "").strip()
                    or not r.get("Example", "").strip())
        checks.append({
            "subject": key, "name": meta["name"], "rows": len(rows),
            "unique_ids": len(set(ids)) == len(ids),
            "empty_critical": empty, "image": img, "generic": gen,
            "specific": len(rows) - gen,
        })
    summary = ""
    spath = os.path.join(DATA_DIR, "stage2_summary.txt")
    if os.path.exists(spath):
        with open(spath, encoding="utf-8") as f:
            summary = f.read()
    return {"checks": checks, "summary_text": summary}


@app.get("/api/health")
def health():
    return {"ok": True, "rows": {k: len(v) for k, v in DATA.items()},
            "options_indexed": len(OPTIONS)}
