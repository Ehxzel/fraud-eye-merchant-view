
# Moving Fraud Detection to Supabase Edge Function

This guide outlines how to move the IPQS fraud detection to a Supabase Edge Function to capture real client IP addresses.

## Step 1: Create the Edge Function

1. Create a new file at `supabase/functions/fraud-check/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import axios from "https://esm.sh/axios@1.6.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the Auth context of the function
const supabaseClient = createClient(
  // Supabase API URL - env var exported by default.
  Deno.env.get('SUPABASE_URL') ?? '',
  // Supabase API ANON KEY - env var exported by default.
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  // Create client with Auth context of the function
  {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! },
    },
  }
);

// IPQS API key - you need to set this in your Supabase dashboard
const IPQS_API_KEY = Deno.env.get('IPQS_API_KEY') || '';
const IPQS_API_URL = `https://www.ipqualityscore.com/api/json/report/${IPQS_API_KEY}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Parse request
    const { transaction_id, amount, user_id, timestamp } = await req.json();
    
    // Extract the real client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                   req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-real-ip') || 
                   '192.168.1.1';
    
    // Get user email from Supabase
    const { data: user, error: userError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user_id)
      .single();
    
    if (userError) {
      console.error(`Failed to fetch user email: ${userError.message}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userEmail = user?.email || `user-${user_id}@fraudeye.com`;
    
    // Call IPQS API
    const response = await axios.post(
      IPQS_API_URL,
      {
        amount,
        timestamp: new Date(timestamp).toISOString(),
        email: userEmail,
        ip_address: clientIP,
        transaction_id: `tx-${transaction_id || Date.now()}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Process response
    const fraudScore = response.data.fraud_score / 100; // Normalize to 0-1
    
    // Update the transaction with the fraud score
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ fraud_score: fraudScore })
      .eq('id', transaction_id);
    
    if (updateError) {
      console.error(`Failed to update transaction: ${updateError.message}`);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create an alert if needed
    if (fraudScore > 0.8) {
      const { error: alertError } = await supabaseClient
        .from('fraud_alerts')
        .insert({ 
          transaction_id, 
          alert_type: 'High Fraud Risk' 
        });
        
      if (alertError) {
        console.error(`Failed to create alert: ${alertError.message}`);
      }
    }
    
    // Return the fraud score
    return new Response(
      JSON.stringify({ fraud_score: fraudScore }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Error in fraud-check function: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Step 2: Deploy the Edge Function

1. Install Supabase CLI if you haven't already:
```bash
npm install -g supabase
```

2. Deploy the function:
```bash
supabase functions deploy fraud-check
```

## Step 3: Set Environment Variables

1. In Supabase Dashboard, go to Settings > API > Edge Functions.
2. Add environment variable `IPQS_API_KEY` with your API key.

## Step 4: Update Front-end Code

Replace the direct IPQS API call with a call to your Edge Function:

```typescript
// In src/lib/api.ts
async createTransaction(amount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  // Create the transaction first
  const { data, error } = await supabase
    .from('transactions')
    .insert({ user_id: user.id, amount })
    .select()
    .single();
  
  if (error) throw error;
  
  // Call the Edge Function for fraud detection
  const { data: fraudData, error: fraudError } = await supabase.functions.invoke('fraud-check', {
    body: {
      transaction_id: data.id,
      amount: data.amount,
      user_id: user.id,
      timestamp: data.timestamp
    }
  });
  
  if (fraudError) {
    console.error('Error calling fraud detection:', fraudError);
    // The transaction is already created, so we'll continue
  }
  
  return data;
}
```

## Step 5: Testing

1. Create a test transaction in your app.
2. Check Supabase logs to verify the Edge Function is called.
3. Verify the transaction is updated with a fraud score.
4. Check if alerts are created for high-risk transactions.

## Benefits

- Access to real client IP addresses
- Server-side API key security
- Better error handling and performance
- Ability to run more complex fraud detection logic
