import { supabase } from './supabase';

// Placeholder for the Arya API key - will be replaced with environment variable in production
const ARYA_API_KEY = import.meta.env.VITE_ARYA_API_KEY || 'your-arya-ai-key';

export const api = {
  // Transactions
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data.map((transaction: any) => ({
      id: `tx_${transaction.id}`,
      customer: transaction.user_id, // This would be replaced with actual customer name in a real app
      amount: transaction.amount,
      date: new Date(transaction.timestamp).toLocaleString(),
      riskScore: transaction.fraud_score * 100 || 0,
      status: transaction.status === 'approved' 
        ? 'approved' 
        : transaction.status === 'blocked' 
          ? 'blocked' 
          : 'flagged'
    }));
  },

  async createTransaction(amount: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, amount })
      .select()
      .single();
    
    if (error) throw error;
    
    // In a real app, this would be replaced with an actual call to the Arya AI API
    console.log(`Would call Arya AI with API key: ${ARYA_API_KEY}`);
    
    // Simulate fraud score calculation
    const fraudScore = Math.random();
    
    await supabase
      .from('transactions')
      .update({ fraud_score: fraudScore })
      .eq('id', data.id);
    
    if (fraudScore > 0.8) {
      await supabase
        .from('fraud_alerts')
        .insert({ 
          transaction_id: data.id, 
          alert_type: 'High Fraud Risk' 
        });
    }
    
    return data;
  },
  
  // Alerts
  async getAlerts() {
    const { data, error } = await supabase
      .from('fraud_alerts')
      .select(`
        *,
        transaction:transactions(*)
      `)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data.map((alert: any) => ({
      id: `alert_${alert.id}`,
      message: alert.alert_type,
      time: new Date(alert.timestamp).toLocaleString(),
      severity: alert.alert_type.includes('High') ? 'high' : 
                alert.alert_type.includes('Medium') ? 'medium' : 'low'
    }));
  },
  
  // Analytics
  async getMetrics() {
    // This would be replaced with actual analytics queries in a real app
    return {
      riskScore: 18.7,
      dailyTransactions: 1245,
      blockedAttempts: 37,
      flaggedForReview: 58,
      previousRiskScore: 22.3,
      previousDailyTransactions: 980,
      previousBlockedAttempts: 42,
      previousFlaggedForReview: 45
    };
  },
  
  async getRiskData() {
    // This would be replaced with actual risk data queries in a real app
    return [
      { time: "00:00", value: 22 },
      { time: "03:00", value: 18 },
      { time: "06:00", value: 16 },
      { time: "09:00", value: 15 },
      { time: "12:00", value: 19 },
      { time: "15:00", value: 21 },
      { time: "18:00", value: 17 },
      { time: "21:00", value: 20 },
      { time: "Now", value: 18 }
    ];
  },
  
  async getTrendData() {
    // This would be replaced with actual trend data queries in a real app
    return [
      { name: "Mon", approved: 120, flagged: 15, blocked: 5 },
      { name: "Tue", approved: 132, flagged: 18, blocked: 8 },
      { name: "Wed", approved: 101, flagged: 25, blocked: 12 },
      { name: "Thu", approved: 134, flagged: 20, blocked: 10 },
      { name: "Fri", approved: 156, flagged: 28, blocked: 15 },
      { name: "Sat", approved: 79, flagged: 12, blocked: 5 },
      { name: "Sun", approved: 85, flagged: 10, blocked: 3 }
    ];
  }
};
