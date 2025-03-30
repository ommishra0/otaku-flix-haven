
import React from "react";
import { Area, AreaChart as RechartsAreaChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AreaChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  yAxisWidth?: number;
  showAnimation?: boolean;
  className?: string;
}

export const AreaChart = ({
  data,
  categories,
  index,
  colors = ["#7661E4"],
  yAxisWidth = 40,
  showAnimation = false,
  className,
}: AreaChartProps) => {
  const config = categories.reduce((acc, category, i) => {
    acc[category] = {
      color: colors[i % colors.length],
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <ChartContainer className={className} config={config}>
      <RechartsAreaChart data={data}>
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
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            fill={colors[i % colors.length]}
            stroke={colors[i % colors.length]}
            isAnimationActive={showAnimation}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  );
};
