
# Testing the IPQS Fraud Detection Integration

This guide provides steps to verify that your IPQS fraud detection integration is working correctly.

## 1. Verify Environment Variables

Make sure your IPQS API key is properly set:

```javascript
// In development, check in the browser console
console.log(import.meta.env.VITE_IPQS_API_KEY);
```

## 2. Test Transaction Creation and Fraud Detection

1. Open the browser console (F12 or right-click and select "Inspect")
2. Create a new transaction in your app
3. Look for these console logs:
   - API request to IPQS
   - Fraud score calculation
   - Any error messages

Example console output for successful detection:
```
IPQS fraud score: 0.42 for transaction 100
```

## 3. Test Different Risk Scenarios

You can test different risk scores by temporarily modifying the IPQS response handling:

```javascript
// In src/lib/ipqs.ts, for testing only:
const mockFraudScore = 0.9; // High risk
console.info(`IPQS fraud score (mocked): ${mockFraudScore}`);
return mockFraudScore;
```

This should trigger high-risk alerts in your system.

## 4. Verify Database Updates

Check that transactions in Supabase are updated with fraud scores:

1. Go to Supabase dashboard
2. Navigate to Table Editor > transactions
3. Verify that new transactions have a `fraud_score` value

## 5. Verify Alert Creation

For high-risk transactions (score > 0.8):

1. Go to Supabase dashboard
2. Navigate to Table Editor > fraud_alerts
3. Verify that alerts are created for high-risk transactions

## 6. Check Edge Function Integration (if implemented)

If you implemented the Edge Function:

1. Deploy the Edge Function
2. Create a test transaction
3. Check Edge Function logs in Supabase dashboard
4. Verify that the function successfully:
   - Receives transaction data
   - Calls IPQS API
   - Updates the transaction with a fraud score
   - Creates an alert if needed

## 7. Troubleshooting

Common issues:

- **CORS errors**: Make sure your Edge Function includes proper CORS headers
- **Authorization errors**: Check that your Supabase client is properly authenticated
- **IPQS API errors**: Verify your API key and request format
- **Database errors**: Check your RLS policies to ensure the function can write to your tables
