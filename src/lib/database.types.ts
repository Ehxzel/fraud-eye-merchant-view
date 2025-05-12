
// Define our database schema types since we can't modify the read-only types.ts file
export type Tables = {
  transactions: {
    id: string;
    user_id: string;
    amount: number;
    timestamp: string;
    fraud_score?: number;
    status: 'approved' | 'flagged' | 'blocked';
  };
  fraud_alerts: {
    id: string;
    transaction_id: string;
    alert_type: string;
    timestamp: string;
  };
  profiles: {
    id: string;
    email?: string;
  };
};

// Type guard to check if data is null
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

// Helper type for Supabase responses
export type PostgrestResponse<T> = {
  data: T | null;
  error: any;
};
