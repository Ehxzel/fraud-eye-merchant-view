
import axios from 'axios';
import { supabase } from './supabase';

// Placeholder for the IPQS API key - will be replaced with environment variable in production
const IPQS_API_KEY = import.meta.env.VITE_IPQS_API_KEY || 'kCf70i2q5Zp4Oo6jq2wqzu5xyoq3dUFx';
const IPQS_API_URL = `https://www.ipqualityscore.com/api/json/report/${IPQS_API_KEY}`;

export interface FraudCheckParams {
  amount: number;
  timestamp: Date;
  user_id: string;
  id?: string;
  userEmail?: string;
  userIp?: string;
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone?: string;
  payment_method?: string;
}

interface IPQSResponse {
  success: boolean;
  fraud_score: number;
  risk_level?: 'low' | 'medium' | 'high';
  message?: string;
  proxy?: boolean;
  vpn?: boolean;
  tor?: boolean;
  [key: string]: any; // For additional fields returned by IPQS
}

/**
 * Sends transaction data to IPQualityScore Fraud Detection API for fraud detection.
 * @param transaction - Transaction details (e.g., { amount, timestamp, user_id }).
 * @returns Fraud score (0 to 1, where higher means more likely fraud).
 */
export const checkFraud = async (transaction: FraudCheckParams): Promise<number> => {
  try {
    // Get user email from Supabase if not provided
    let userEmail = transaction.userEmail;
    if (!userEmail) {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', transaction.user_id)
        .single();
      
      if (error) {
        console.error(`Failed to fetch user email: ${error.message}`);
      }
      
      userEmail = user?.email || `user-${transaction.user_id}@fraudeye.com`;
    }

    // Use provided IP or fallback to placeholder
    const userIp = transaction.userIp || '192.168.1.1';

    // Prepare request payload with all available data
    const payload: Record<string, any> = {
      amount: transaction.amount,
      timestamp: transaction.timestamp.toISOString(),
      email: userEmail,
      ip_address: userIp,
      transaction_id: `tx-${transaction.id || Date.now()}`,
    };

    // Add optional fields if available
    if (transaction.billing_address) {
      payload.billing_address = transaction.billing_address;
    }

    if (transaction.phone) {
      payload.phone = transaction.phone;
    }

    if (transaction.payment_method) {
      payload.payment_method = transaction.payment_method;
    }

    const response = await axios.post<IPQSResponse>(
      IPQS_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if the request was successful
    if (!response.data.success) {
      throw new Error(response.data.message || 'IPQS API request failed');
    }

    // Response: { fraud_score: 85, risk_level: 'high', ... }
    const fraudScore = response.data.fraud_score / 100; // Normalize to 0-1
    if (typeof fraudScore !== 'number' || fraudScore < 0 || fraudScore > 1) {
      throw new Error(`Invalid fraud score: ${fraudScore}`);
    }

    console.info(`IPQS fraud score: ${fraudScore} for transaction ${transaction.amount}`);
    
    // Log additional risk indicators if present
    if (response.data.proxy) console.info('Risk indicator: Proxy detected');
    if (response.data.vpn) console.info('Risk indicator: VPN detected');
    if (response.data.tor) console.info('Risk indicator: TOR network detected');
    
    return fraudScore;
  } catch (error) {
    console.error(`IPQS API error: ${error instanceof Error ? error.message : String(error)}`);
    return 0; // Fallback to safe score
  }
};
