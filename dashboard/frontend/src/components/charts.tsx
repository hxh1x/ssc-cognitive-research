import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const AXIS = { fontSize: 11, fill: "#7d8aa0" } as const;
const TIP = {
  backgroundColor: "#131a24",
  border: "1px solid #26303e",
  borderRadius: 6,
  fontSize: 12,
  color: "#dbe2ec",
} as const;

const PIE_COLORS = ["#38bdf8", "#818cf8", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#94a3b8", "#f87171"];

export function VBar({ data, height = 220, color = "#38bdf8", xKey = "name", yKey = "count", onClick }: {
  data: { name: string; count: number }[]; height?: number; color?: string;
  xKey?: string; yKey?: string; onClick?: (name: string) => void;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data.slice(0, 20)} margin={{ top: 4, right: 4, bottom: 4, left: -12 }}>
        <CartesianGrid stroke="#1a2230" vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} interval="preserveStartEnd" tick={false} />
        <YAxis {...AXIS} allowDecimals={false} width={44} />
        <Tooltip contentStyle={TIP} formatter={(v: any) => [Number(v).toLocaleString(), "questions"]} />
        <Bar dataKey={yKey} fill={color} radius={[3, 3, 0, 0]} onClick={(d: any) => onClick?.(d?.[xKey] ?? d?.name)} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Trend({ data, height = 180 }: { data: { year: string; count: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={[...data].sort((a, b) => (a.year ?? "").localeCompare(b.year ?? ""))} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
        <CartesianGrid stroke="#1a2230" vertical={false} />
        <XAxis dataKey="year" {...AXIS} />
        <YAxis {...AXIS} allowDecimals={false} width={44} />
        <Tooltip contentStyle={TIP} formatter={(v: any) => [Number(v).toLocaleString(), "questions"]} />
        <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3, fill: "#38bdf8" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 200 }: { data: { name: string; count: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} strokeWidth={0}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={TIP} formatter={(v: any, n: any) => [Number(v).toLocaleString(), n]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function LegendChips({ data }: { data: { name: string; count: number }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-slate-400">
      {data.map((d, i) => (
        <span key={d.name} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
          {d.name} <span className="tabular-nums text-slate-500">{d.count.toLocaleString()}</span>
        </span>
      ))}
    </div>
  );
}
