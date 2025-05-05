
import axios from 'axios';
import { supabase } from './supabase';

// Placeholder for the IPQS API key - will be replaced with environment variable in production
const IPQS_API_KEY = import.meta.env.VITE_IPQS_API_KEY || 'kCf70i2q5Zp4Oo6jq2wqzu5xyoq3dUFx';
const IPQS_API_URL = `https://www.ipqualityscore.com/api/json/report/${IPQS_API_KEY}`;

interface FraudCheckParams {
  amount: number;
  timestamp: Date;
  user_id: string;
  id?: string;
  userEmail?: string;
  userIp?: string;
}

/**
 * Sends transaction data to IPQualityScore Fraud Detection API for fraud detection.
 * @param transaction - Transaction details (e.g., { amount, timestamp, user_id }).
 * @returns Fraud score (0 to 1, where higher means more likely fraud).
 */
export const checkFraud = async (transaction: FraudCheckParams) => {
  try {
    // Get user email from Supabase if not provided
    let userEmail = transaction.userEmail;
    if (!userEmail) {
      const { data: user } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', transaction.user_id)
        .single();
      
      userEmail = user?.email || `user-${transaction.user_id}@fraudeye.com`;
    }

    // Use provided IP or fallback to placeholder
    const userIp = transaction.userIp || '192.168.1.1';

    const response = await axios.post(
      IPQS_API_URL,
      {
        amount: transaction.amount,
        timestamp: transaction.timestamp.toISOString(),
        email: userEmail,
        ip_address: userIp,
        transaction_id: `tx-${transaction.id || Date.now()}`,
        // Add fields like billing_address or phone if available
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Response: { fraud_score: 85, risk_level: 'high', ... }
    const fraudScore = response.data.fraud_score / 100; // Normalize to 0-1
    if (typeof fraudScore !== 'number' || fraudScore < 0 || fraudScore > 1) {
      throw new Error(`Invalid fraud score: ${fraudScore}`);
    }

    console.info(`IPQS fraud score: ${fraudScore} for transaction ${transaction.amount}`);
    return fraudScore;
  } catch (error) {
    console.error(`IPQS API error: ${error instanceof Error ? error.message : String(error)}`);
    return 0; // Fallback to safe score
  }
};
