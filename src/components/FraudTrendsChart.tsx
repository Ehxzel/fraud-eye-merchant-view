
import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type TrendDataPoint = {
  name: string;
  approved: number;
  flagged: number;
  blocked: number;
};

type FraudTrendsChartProps = {
  isLoading: boolean;
  data: TrendDataPoint[];
};

const FraudTrendsChart: React.FC<FraudTrendsChartProps> = ({ isLoading, data }) => {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
          <p className="text-sm font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color }}
            >{`${entry.name}: ${entry.value}`}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="name"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="approved" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="flagged" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="blocked" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FraudTrendsChart;
