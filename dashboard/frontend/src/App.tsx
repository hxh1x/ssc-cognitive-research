import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FilterProvider } from "./filters";
import { Layout } from "./components/ui";
import Overview from "./pages/Overview";
import Subject from "./pages/Subject";
import Topic from "./pages/Topic";
import Questions from "./pages/Questions";
import Archetypes from "./pages/Archetypes";
import Traps from "./pages/Traps";
import Methods from "./pages/Methods";
import Papers from "./pages/Papers";
import Quality from "./pages/Quality";
import About from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <FilterProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/subject/:key" element={<Subject />} />
            <Route path="/topic/:subject/:name" element={<Topic />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/archetypes" element={<Archetypes />} />
            <Route path="/traps" element={<Traps />} />
            <Route path="/methods" element={<Methods />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </FilterProvider>
    </BrowserRouter>
  );
}
