
import React from "react";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface BarChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  yAxisWidth?: number;
  showAnimation?: boolean;
  className?: string;
}

export const BarChart = ({
  data,
  categories,
  index,
  colors = ["#7661E4"],
  yAxisWidth = 40,
  showAnimation = false,
  className,
}: BarChartProps) => {
  const config = categories.reduce((acc, category, i) => {
    acc[category] = {
      color: colors[i % colors.length],
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <ChartContainer className={className} config={config}>
      <RechartsBarChart data={data}>
        <XAxis dataKey={index} />
        <YAxis width={yAxisWidth} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <ChartTooltip
          content={({ active, payload, label }) => (
            <ChartTooltipContent
              active={active}
              payload={payload}
              label={label}
            />
          )}
        />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            isAnimationActive={showAnimation}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};
