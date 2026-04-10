import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from "recharts";

export default function GraficoAxolote({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="data" />

      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />

      <Tooltip 
        formatter={(value, name) => {
          if (name === "Peso (g)") return `${value} g`;
          if (name === "Tamanho (cm)") return `${value} cm`;
          return value;
        }}
      />

      <Legend />

      <Line
        yAxisId="left"
        type="monotone"
        dataKey="peso"
        name="Peso (g)"
        stroke="#8884d8"
        strokeWidth={2}
        dot={{ r: 4 }}
      />

      <Line
        yAxisId="right"
        type="monotone"
        dataKey="tamanho"
        name="Tamanho (cm)"
        stroke="#82ca9d"
        strokeWidth={2}
        dot={{ r: 4 }}
      />
    </LineChart>
  );
}