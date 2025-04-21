
import React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type RiskDataPoint = {
  time: string;
  value: number;
};

type RiskScoreChartProps = {
  isLoading: boolean;
  data: RiskDataPoint[];
};

const RiskScoreChart: React.FC<RiskScoreChartProps> = ({ isLoading, data }) => {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
          <p className="text-sm font-medium">{`${label}`}</p>
          <p className="text-sm text-teal-600">{`Risk Score: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="time"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0d9488"
          strokeWidth={2}
          activeDot={{ r: 6, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
          dot={{ r: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RiskScoreChart;
