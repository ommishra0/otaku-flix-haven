
import React from "react";
import { Pie, PieChart as RechartsPieChart, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  colors?: string[];
  showAnimation?: boolean;
  className?: string;
}

export const PieChart = ({
  data,
  category,
  index,
  colors = ["#7661E4", "#FF5E4D", "#4ECDC4", "#FF6B6B", "#C44D58"],
  showAnimation = false,
  className,
}: PieChartProps) => {
  const config = data.reduce((acc, entry, i) => {
    acc[entry[index]] = {
      color: colors[i % colors.length],
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <ChartContainer className={className} config={config}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          isAnimationActive={showAnimation}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <ChartTooltip
          content={({ active, payload }) => (
            <ChartTooltipContent
              active={active}
              payload={payload}
              nameKey={index}
              labelKey={category}
            />
          )}
        />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
};
