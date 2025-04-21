
import React from "react";
import { Card } from "@/components/ui/card";
import DashboardHeader from "@/components/DashboardHeader";
import MetricsOverview from "@/components/MetricsOverview";
import RecentTransactions from "@/components/RecentTransactions";
import FraudAlerts from "@/components/FraudAlerts";
import RiskScoreChart from "@/components/RiskScoreChart";
import FraudTrendsChart from "@/components/FraudTrendsChart";
import { useDataProvider } from "@/hooks/useDataProvider";

const Dashboard = () => {
  const { metrics, transactions, alerts, riskData, trendData, isLoading } = useDataProvider();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Fraud Monitoring Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MetricsOverview isLoading={isLoading} metrics={metrics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Score Trend</h2>
            <RiskScoreChart isLoading={isLoading} data={riskData} />
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Fraud Trends</h2>
            <FraudTrendsChart isLoading={isLoading} data={trendData} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
              <RecentTransactions isLoading={isLoading} transactions={transactions} />
            </Card>
          </div>
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Fraud Alerts</h2>
              <FraudAlerts isLoading={isLoading} alerts={alerts} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
