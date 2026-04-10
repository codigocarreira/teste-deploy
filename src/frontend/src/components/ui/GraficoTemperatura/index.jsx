import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid
} from "recharts";

export function GraficoTemperatura({ data }) {
  return (
    <LineChart width={500} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="data" />
      <YAxis />
      <Tooltip />

      <Line
        type="monotone"
        dataKey="temperatura"
        stroke="#ff7300"
        name="Temperatura (°C)"
        dot={{ r: 3 }}
      />
    </LineChart>
  );
}