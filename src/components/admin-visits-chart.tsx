import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { day: string; v: number };

export default function VisitsChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <Tooltip />
        <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
