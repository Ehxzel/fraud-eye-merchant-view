
import { supabase } from '@/integrations/supabase/client';

export interface FraudCheckRequest {
  amount: number;
  userEmail?: string;
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone?: string;
  payment_method?: string;
  user_id?: string;
}

export interface FraudCheckResponse {
  success: boolean;
  fraud_score: number;
  risk_level: 'low' | 'medium' | 'high';
  ip_address: string;
  country: string;
  region: string;
  city: string;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  bot_status: boolean;
  recent_abuse: boolean;
  risk_factors: string[];
  connection_type: string;
  isp: string;
  error?: string;
}

export const checkFraudWithEdgeFunction = async (params: FraudCheckRequest): Promise<FraudCheckResponse> => {
  try {
    console.log('Calling fraud-check Edge Function with params:', params);
    
    const { data, error } = await supabase.functions.invoke('fraud-check', {
      body: params
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message || 'Failed to call fraud detection service');
    }

    if (!data.success) {
      console.error('Fraud check failed:', data.error);
      throw new Error(data.error || 'Fraud detection failed');
    }

    console.log('Fraud check completed:', data);
    return data;
    
  } catch (error) {
    console.error('Fraud service error:', error);
    // Return safe fallback response
    return {
      success: false,
      fraud_score: 0,
      risk_level: 'low',
      ip_address: 'Unknown',
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      proxy: false,
      vpn: false,
      tor: false,
      bot_status: false,
      recent_abuse: false,
      risk_factors: ['Service unavailable'],
      connection_type: 'Unknown',
      isp: 'Unknown',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
