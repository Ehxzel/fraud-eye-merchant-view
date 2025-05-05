
# Testing the IPQS Fraud Detection Integration

This guide provides comprehensive steps to test your IPQS fraud detection integration.

## Automated Tests

We've implemented a test suite for the IPQS integration using Vitest. You can run these tests with:

```bash
npm run test
```

If you need to run just the IPQS tests:

```bash
npm run test -- src/lib/ipqs.test.ts
```

### Test Suite Coverage

The test suite verifies:
- Basic API integration and fraud score calculation
- Fetching user email when not provided
- Error handling when API calls fail
- Correct handling of high-risk transactions
- Proper inclusion of optional transaction details

## Manual Testing

You can also test the integration manually:

### 1. Verify Environment Variables

Make sure your IPQS API key is properly set:

```javascript
// In development, check in the browser console
console.log(import.meta.env.VITE_IPQS_API_KEY);
```

### 2. Test Transaction Creation and Fraud Detection

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

### 3. Test Different Risk Scenarios

You can temporarily modify the IPQS response to test different risk scenarios:

```javascript
// In src/lib/ipqs.ts, add this temporarily for testing:
// At the start of the try block:
if (process.env.NODE_ENV === 'development') {
  console.info('Using test fraud score for development');
  return transaction.amount > 1000 ? 0.9 : 0.2;
}
```

Just remember to remove this test code before deploying to production.

### 4. Verify Database Updates

Check that transactions in Supabase are updated with fraud scores:

1. Go to Supabase dashboard
2. Navigate to Table Editor > transactions
3. Verify that new transactions have a `fraud_score` value

### 5. Verify Alert Creation

For high-risk transactions (score > 0.8):

1. Go to Supabase dashboard
2. Navigate to Table Editor > fraud_alerts
3. Verify that alerts are created for high-risk transactions

## Testing with Edge Functions

If you're using Supabase Edge Functions:

1. Deploy the Edge Function
2. Create a test transaction
3. Check Edge Function logs in Supabase dashboard
4. Verify that the function:
   - Receives transaction data
   - Calls IPQS API
   - Updates the transaction with a fraud score
   - Creates an alert if needed

## Troubleshooting

Common issues:

- **CORS errors**: Make sure your Edge Function includes proper CORS headers
- **Authorization errors**: Check that your Supabase client is properly authenticated
- **IPQS API errors**: Verify your API key and request format
- **Database errors**: Check your RLS policies to ensure the function can write to your tables
- **Missing data**: Ensure all required fields are being passed correctly
