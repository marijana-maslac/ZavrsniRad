"use client";

import { PieChart, Pie, Tooltip, Legend } from "recharts";

type Props = {
  data: { name: string; value: number }[];
};

const getColor = (name: string) => {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  hash = Math.abs(Math.sin(hash) * 10000);

  const hue = hash % 360;

  return `hsl(${hue}, 90%, 60%)`;
};

export default function CategoryPieChart({ data }: Props) {
  const dataWithColors = data.map((item) => ({
    ...item,
    fill: getColor(item.name),
  }));
  const filteredData = dataWithColors.filter((item) => item.value > 0);
  return (
    <div>
      <h2>Recepti po kategorijama</h2>

      <PieChart width={800} height={400}>
        <Pie
          data={filteredData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={({ name, value }) => `${name} (${value})`}
          fill="#8884d8"
        />

        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
