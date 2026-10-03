import React, { createContext, useContext, useState } from "react";

export interface Filters {
  subject: string;
  year: string;
  shift: string;
  topic: string;
  subtopic: string;
  micro: string;
  archetype: string;
  form: string;
  difficulty: string;
  language: string;
  recognition: string;
  calc: string;
  image: string;
  q: string;
}

export const EMPTY_FILTERS: Filters = {
  subject: "all", year: "", shift: "", topic: "", subtopic: "", micro: "",
  archetype: "", form: "", difficulty: "", language: "", recognition: "",
  calc: "", image: "", q: "",
};

interface Ctx {
  f: Filters;
  set: (patch: Partial<Filters>) => void;
  clear: () => void;
}

const FilterCtx = createContext<Ctx>({ f: EMPTY_FILTERS, set: () => {}, clear: () => {} });

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [f, setF] = useState<Filters>(EMPTY_FILTERS);
  const set = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }));
  const clear = () => setF(EMPTY_FILTERS);
  return <FilterCtx.Provider value={{ f, set, clear }}>{children}</FilterCtx.Provider>;
}

export function useFilters() {
  return useContext(FilterCtx);
}
