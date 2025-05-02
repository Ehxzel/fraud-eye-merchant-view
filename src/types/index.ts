
export type Transaction = {
  id: string;
  customer: string;
  amount: number;
  date: string;
  riskScore: number;
  status: "approved" | "flagged" | "blocked";
};

export type Alert = {
  id: string;
  message: string;
  time: string;
  severity: "high" | "medium" | "low";
};

export type Metric = {
  riskScore: number;
  dailyTransactions: number;
  blockedAttempts: number;
  flaggedForReview: number;
  previousRiskScore: number;
  previousDailyTransactions: number;
  previousBlockedAttempts: number;
  previousFlaggedForReview: number;
};

export type RiskDataPoint = {
  time: string;
  value: number;
};

export type TrendDataPoint = {
  name: string;
  approved: number;
  flagged: number;
  blocked: number;
};
