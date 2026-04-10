import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from "recharts";

export function GraficoPH({ data }) {
  return (
    <LineChart width={500} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="data" />
      <YAxis />
      <Tooltip />

      <Line
        type="monotone"
        dataKey="ph"
        stroke="#00c49f"
        name="pH"
        dot={{ r: 3 }}
      />
    </LineChart>
  );
}