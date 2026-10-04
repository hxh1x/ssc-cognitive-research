# SSC CGL PYQs - Mind Map & ER Diagram

This document contains the mind map visualization and entity-relationship diagram based on the SSC CGL PYQ analysis data.

## 1. Mind Map (High-Level Topic Structure)

```mermaid
mindmap
  root["SSC CGL (4 Subjects)"]
    English["English (E)"]
      Grammar["Grammar Knowledge"]
        ErrorDetection["Error Detection (150q)"]
        SentenceImprovement["Sentence Improvement (207q)"]
        Voice["Active/Passive Voice (176q)"]
        Speech["Direct/Indirect Speech (95q)"]
      Vocabulary["Word Knowledge"]
        Synonyms["Synonyms (139q)"]
        Antonyms["Antonyms (158q)"]
        OneWord["One-Word Substitution (202q)"]
        Spellings["Spellings (134q)"]
        Idioms["Idioms & Phrases (124q)"]
      Reading["Reading & Context"]
        RC["Reading Comprehension (178q)"]
        Cloze["Cloze Passage (262q)"]
        ParaJumbles["Para Jumbles (168q)"]
        FillBlanks["Fill in Blanks (139q)"]
    Quant["Quantitative Aptitude (Q)"]
      Mensuration["Mensuration (264q)"]
      Geometry["Geometry (245q)"]
      Algebra["Algebra & Equations (156q)"]
      Percentage["Percentages/Ratio (184q)"]
      ProfitLoss["Profit & Loss (168q)"]
      Trig["Trigonometry (139q)"]
      TSD["Time-Speed-Distance (117q)"]
      SI_CI["SI/CI (111q)"]
      TW["Time & Work (111q)"]
    Reasoning["Reasoning (R)"]
      Series["Number/Alphabet Series (382q)"]
      Operators["Mathematical Operators (228q)"]
      Analogy["Analogy (220q)"]
      Coding["Coding-Decoding (207q)"]
      Blood["Blood Relations (176q)"]
      Syllogism["Syllogism (161q)"]
      Misc["Miscellaneous (207q)"]
    GA["General Awareness (G)"]
      Current["Current Affairs (293q)"]
      Art["Art & Culture (271q)"]
      Polity["Polity (268q)"]
      Sports["Sports (256q)"]
      Economy["Economy (199q)"]
      Geography["Geography (174q)"]
      History["History (304q)"]
      Science["Physics/Chem/Bio (242q)"]
```


## 2. ER Diagram (Data Model)

Shows relationships between Concepts (learning hierarchy), Dependencies (prerequisites), and Questions (pattern database).

```mermaid
erDiagram
    CONCEPT {
        string node_id PK
        string parent_id FK "Parent in hierarchy"
        int level
        string subject
        string topic
        string subtopic
        string micro_concept
    }
    CONCEPT_DEPENDENCY {
        string prerequisite_node FK
        string dependent_node FK
        string dependency_type
    }
    QUESTION {
        string question_id PK
        string subject
        string topic
        string micro_concept
    }
    CONCEPT ||--o{ CONCEPT : "parent_of"
    CONCEPT }|--o{ CONCEPT_DEPENDENCY : "is_prereq_for"
    CONCEPT }|--o{ CONCEPT_DEPENDENCY : "depends_on"
    CONCEPT ||--o{ QUESTION : "assessed_by"
```


## 3. Detailed ER Diagram (Full Schema)

Complete entity relationships across hierarchy, dependencies, pattern DBs, and structured questions.

# ER Diagram - Detailed Schema

```mermaid
erDiagram
    CONCEPT {
        string node_id PK
        string parent_id FK
        int level
        string subject
        string domain
        string topic
        string subtopic
        string micro_concept
        string concept_type
        string prerequisites
        string unlocks
        int learning_order
        int question_count
    }
    CONCEPT_DEPENDENCY {
        string prerequisite_node PK_FK
        string dependent_node PK_FK
        string dependency_type
        string evidence_basis
        string confidence
    }
    QUESTION_PATTERN {
        string question_id PK
        int year
        string shift
        string subject
        string topic
        string subtopic
        string micro_concept
        string question_archetype
        string question_form
        string difficulty
        int estimated_time
        string trap
        string standard_method
    }
    AWARENESS_PATTERN {
        string question_id PK
        int year
        string shift
        string subject
        string domain
        string topic
        string subtopic
        string fact_type
        string question_form
        string difficulty
        string static_current
    }
    STRUCTURED_QUESTION {
        string composite_id PK "Paper+Qnum"
        string paper
        string source_file
        string section
        int question_number
        text question_text
        string answer_key
        boolean is_image_based
        int question_word_count
        string sub_topic
    }
    CONCEPT ||--o{ CONCEPT : "is_parent_of"
    CONCEPT ||--o{ CONCEPT_DEPENDENCY : "prerequisite"
    CONCEPT ||--o{ CONCEPT_DEPENDENCY : "dependent_on"
    CONCEPT ||--o{ QUESTION_PATTERN : "maps_to"
    CONCEPT ||--o{ AWARENESS_PATTERN : "maps_to"
    QUESTION_PATTERN ||--o{ STRUCTURED_QUESTION : "corresponds_to"
    AWARENESS_PATTERN ||--o{ STRUCTURED_QUESTION : "corresponds_to"
```


## 4. Key Statistics

- Total Concepts (Nodes): 3276
- Total Dependencies (Edges): 3598
- Concepts by Subject: {'English': 359, 'GA': 1460, 'Quant': 1022, 'Reasoning': 435}
- Concepts by Level: {'0': 4, '1': 65, '2': 71, '3': 432, '4': 648, '5': 857, '6': 1199}

### Question Counts by Subject (from Pattern DBs)
- Quant: 2200 questions
- English: 2200 questions
- Reasoning: 2200 questions
- GA: 2200 questions
