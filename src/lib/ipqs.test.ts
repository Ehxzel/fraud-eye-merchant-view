
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkFraud, type FraudCheckParams } from './ipqs';
import axios from 'axios';
import { supabase } from './supabase'; // Fixed import path
import { PostgrestResponse } from './database.types';

// Mock external dependencies
vi.mock('axios');
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { email: 'test@example.com' }, error: null }),
        })),
      })),
    })),
  },
}));

describe('IPQS Fraud Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call IPQS API and return normalized fraud score', async () => {
    // Mock axios post to return a successful response
    const mockResponse = {
      data: {
        success: true,
        fraud_score: 75, // Score from 0-100
        risk_level: 'medium',
        proxy: false,
        vpn: false,
        tor: false,
      },
    };
    
    (axios.post as any).mockResolvedValueOnce(mockResponse);
    
    const transaction: FraudCheckParams = {
      amount: 500,
      timestamp: new Date(),
      user_id: 'user123',
      id: 'tx123',
      userEmail: 'test@example.com',
      userIp: '192.168.1.1',
    };
    
    const result = await checkFraud(transaction);
    
    // Check that axios was called with expected parameters
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('https://www.ipqualityscore.com/api/json/report/'),
      expect.objectContaining({
        amount: transaction.amount,
        email: transaction.userEmail,
        ip_address: transaction.userIp,
      }),
      expect.any(Object)
    );
    
    // Expect normalized fraud score (75/100 = 0.75)
    expect(result).toBe(0.75);
  });

  it('should handle missing user email by fetching from Supabase', async () => {
    // Mock successful API response
    (axios.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        fraud_score: 30,
      },
    });
    
    const transaction: FraudCheckParams = {
      amount: 200,
      timestamp: new Date(),
      user_id: 'user456',
      // No email provided
    };
    
    await checkFraud(transaction);
    
    // Verify Supabase was called to get the user email
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  it('should return 0 (safe score) when API call fails', async () => {
    // Mock axios to throw an error
    (axios.post as any).mockRejectedValueOnce(new Error('API Error'));
    
    const transaction: FraudCheckParams = {
      amount: 300,
      timestamp: new Date(),
      user_id: 'user789',
      userEmail: 'test@example.com',
    };
    
    const result = await checkFraud(transaction);
    
    // Should return the safe fallback score
    expect(result).toBe(0);
  });

  it('should detect high-risk transactions correctly', async () => {
    // Mock response with high fraud score
    (axios.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        fraud_score: 95,
        risk_level: 'high',
        proxy: true,
        vpn: true,
      },
    });
    
    const transaction: FraudCheckParams = {
      amount: 2000,
      timestamp: new Date(),
      user_id: 'user999',
      userEmail: 'suspicious@example.com',
      userIp: '10.0.0.1',
      billing_address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US',
      },
    };
    
    const result = await checkFraud(transaction);
    
    // Expect normalized fraud score (95/100 = 0.95)
    expect(result).toBe(0.95);
    
    // Check that additional data was passed to the API
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        billing_address: transaction.billing_address,
      }),
      expect.any(Object)
    );
  });
});
