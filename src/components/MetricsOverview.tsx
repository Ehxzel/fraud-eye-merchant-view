
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Shield, Database } from "lucide-react";

type MetricsProps = {
  isLoading: boolean;
  metrics: {
    riskScore: number;
    dailyTransactions: number;
    blockedAttempts: number;
    flaggedForReview: number;
    previousRiskScore: number;
    previousDailyTransactions: number;
    previousBlockedAttempts: number;
    previousFlaggedForReview: number;
  };
};

const MetricCard = ({ 
  title, 
  value, 
  previousValue, 
  icon, 
  isLoading,
  format = (val: number) => val.toString()
}) => {
  const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = percentChange >= 0;
  
  // For risk score and blocked attempts, lower is better
  const isGood = title === "Risk Score" || title === "Blocked Attempts" ? !isPositive : isPositive;
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-bold">{format(value)}</p>
          )}
        </div>
        <div className={`p-2 rounded-full ${isLoading ? 'bg-slate-100' : isGood ? 'bg-green-100' : 'bg-red-100'}`}>
          {React.cloneElement(icon, { 
            className: `h-5 w-5 ${isLoading ? 'text-slate-400' : isGood ? 'text-green-600' : 'text-red-600'}` 
          })}
        </div>
      </div>
      {!isLoading && (
        <div className={`mt-2 text-xs flex items-center ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          <span>{Math.abs(percentChange).toFixed(1)}% {isPositive ? 'increase' : 'decrease'}</span>
        </div>
      )}
    </Card>
  );
};

const MetricsOverview: React.FC<MetricsProps> = ({ isLoading, metrics }) => {
  const formatRiskScore = (value: number) => `${value.toFixed(1)}%`;
  
  return (
    <>
      <MetricCard 
        title="Risk Score" 
        value={metrics.riskScore} 
        previousValue={metrics.previousRiskScore} 
        icon={<Shield />} 
        isLoading={isLoading}
        format={formatRiskScore}
      />
      <MetricCard 
        title="Daily Transactions" 
        value={metrics.dailyTransactions} 
        previousValue={metrics.previousDailyTransactions} 
        icon={<Database />} 
        isLoading={isLoading}
      />
      <MetricCard 
        title="Blocked Attempts" 
        value={metrics.blockedAttempts} 
        previousValue={metrics.previousBlockedAttempts} 
        icon={<Shield />} 
        isLoading={isLoading}
      />
    </>
  );
};

export default MetricsOverview;
