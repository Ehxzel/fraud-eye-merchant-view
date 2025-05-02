
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Transaction, Alert, Metric, RiskDataPoint, TrendDataPoint } from "@/types";

// Function to simulate WebSocket/SSE connection
const createMockConnection = (callback: (data: any) => void) => {
  // Initial connection delay
  setTimeout(() => {
    api.getTransactions().then(transactions => {
      api.getAlerts().then(alerts => {
        api.getMetrics().then(metrics => {
          api.getRiskData().then(riskData => {
            api.getTrendData().then(trendData => {
              callback({
                metrics,
                transactions,
                alerts,
                riskData,
                trendData
              });
            });
          });
        });
      });
    }).catch(error => {
      console.error("Error fetching initial data:", error);
      // Fallback to mock data
      callback(mockData);
    });
    
    // Simulate occasional updates
    const interval = setInterval(() => {
      // Update with slightly different data for metrics
      api.getMetrics().then(metrics => {
        const updatedMetrics = {
          ...metrics,
          riskScore: metrics.riskScore + (Math.random() * 2 - 1),
          dailyTransactions: metrics.dailyTransactions + Math.floor(Math.random() * 10)
        };
        
        // Random chance to add a new alert
        if (Math.random() > 0.7) {
          api.getAlerts().then(alerts => {
            callback({ metrics: updatedMetrics, alerts });
          });
        } else {
          callback({ metrics: updatedMetrics });
        }
      }).catch(error => {
        console.error("Error updating data:", error);
      });
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, 1500); // Initial connection delay of 1.5 seconds
  
  return () => {}; // Cleanup function
};

// Mock data for demonstration purposes
const mockData = {
  metrics: {
    riskScore: 18.7,
    dailyTransactions: 1245,
    blockedAttempts: 37,
    flaggedForReview: 58,
    previousRiskScore: 22.3,
    previousDailyTransactions: 980,
    previousBlockedAttempts: 42,
    previousFlaggedForReview: 45
  },
  transactions: [
    {
      id: "tx_4f83d1c56b",
      customer: "John Smith",
      amount: 126.99,
      date: "2025-04-21, 10:23 AM",
      riskScore: 12,
      status: "approved" as const
    },
    {
      id: "tx_8a7b39e0c1",
      customer: "Sarah Johnson",
      amount: 499.95,
      date: "2025-04-21, 09:45 AM",
      riskScore: 68,
      status: "flagged" as const
    },
    {
      id: "tx_2e6f91d3a7",
      customer: "Michael Brown",
      amount: 1250.00,
      date: "2025-04-21, 09:12 AM",
      riskScore: 85,
      status: "blocked" as const
    },
    {
      id: "tx_3c5d72e9b8",
      customer: "Emily Wilson",
      amount: 75.50,
      date: "2025-04-21, 08:30 AM",
      riskScore: 5,
      status: "approved" as const
    },
    {
      id: "tx_6d1c48f2a5",
      customer: "David Chen",
      amount: 350.25,
      date: "2025-04-21, 08:05 AM",
      riskScore: 42,
      status: "flagged" as const
    }
  ],
  alerts: [
    {
      id: "alert_1",
      message: "Multiple failed transaction attempts from same IP address",
      time: "10 minutes ago",
      severity: "high" as const
    },
    {
      id: "alert_2",
      message: "Unusual transaction pattern detected for customer David Chen",
      time: "35 minutes ago",
      severity: "medium" as const
    },
    {
      id: "alert_3",
      message: "New device used for customer Sarah Johnson",
      time: "1 hour ago",
      severity: "low" as const
    }
  ],
  riskData: [
    { time: "00:00", value: 22 },
    { time: "03:00", value: 18 },
    { time: "06:00", value: 16 },
    { time: "09:00", value: 15 },
    { time: "12:00", value: 19 },
    { time: "15:00", value: 21 },
    { time: "18:00", value: 17 },
    { time: "21:00", value: 20 },
    { time: "Now", value: 18 }
  ],
  trendData: [
    { name: "Mon", approved: 120, flagged: 15, blocked: 5 },
    { name: "Tue", approved: 132, flagged: 18, blocked: 8 },
    { name: "Wed", approved: 101, flagged: 25, blocked: 12 },
    { name: "Thu", approved: 134, flagged: 20, blocked: 10 },
    { name: "Fri", approved: 156, flagged: 28, blocked: 15 },
    { name: "Sat", approved: 79, flagged: 12, blocked: 5 },
    { name: "Sun", approved: 85, flagged: 10, blocked: 3 }
  ]
};

export const useDataProvider = () => {
  const [data, setData] = useState<{
    metrics: Metric;
    transactions: Transaction[];
    alerts: Alert[];
    riskData: RiskDataPoint[];
    trendData: TrendDataPoint[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const cleanup = createMockConnection((newData) => {
      setData(prevData => ({
        ...prevData,
        ...newData
      }));
      setIsLoading(false);
    });
    
    return cleanup;
  }, []);
  
  return {
    metrics: data?.metrics || mockData.metrics,
    transactions: data?.transactions || mockData.transactions,
    alerts: data?.alerts || mockData.alerts,
    riskData: data?.riskData || mockData.riskData,
    trendData: data?.trendData || mockData.trendData,
    isLoading
  };
};
