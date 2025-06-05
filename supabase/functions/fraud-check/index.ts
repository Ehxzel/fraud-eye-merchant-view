
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the IPQS API key from environment variables
    const IPQS_API_KEY = Deno.env.get('IPQS_API_KEY');
    if (!IPQS_API_KEY) {
      throw new Error('IPQS API key not configured');
    }

    // Create Supabase client with the Auth context of the function
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Parse request body
    const { 
      amount, 
      userEmail, 
      billing_address, 
      phone, 
      payment_method,
      user_id 
    } = await req.json();

    // Extract the real client IP address
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-real-ip') || 
                   '192.168.1.1';

    console.log(`Processing fraud check for IP: ${clientIP}, Amount: ${amount}`);

    // Get user email from Supabase if not provided
    let email = userEmail;
    if (!email && user_id) {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user_id)
        .single();
      
      if (userError) {
        console.error(`Failed to fetch user email: ${userError.message}`);
      }
      
      email = user?.email || `user-${user_id}@fraudeye.com`;
    }

    // Call IPQS IP Detection API
    const ipqsUrl = `https://ipqualityscore.com/api/json/ip/${IPQS_API_KEY}/${clientIP}`;
    
    // Add query parameters for enhanced checking
    const urlParams = new URLSearchParams({
      strictness: '1',
      allow_public_access_points: 'true',
      fast: 'true',
      mobile: 'true'
    });

    const ipResponse = await fetch(`${ipqsUrl}?${urlParams}`);
    const ipData = await ipResponse.json();

    console.log('IPQS IP Response:', ipData);

    // Calculate fraud score based on multiple factors
    let fraudScore = 0;
    let riskFactors = [];

    if (ipData.success) {
      // Base fraud score from IPQS
      fraudScore = (ipData.fraud_score || 0) / 100;
      
      // Additional risk factors
      if (ipData.proxy) {
        fraudScore += 0.2;
        riskFactors.push('Proxy detected');
      }
      if (ipData.vpn) {
        fraudScore += 0.15;
        riskFactors.push('VPN detected');
      }
      if (ipData.tor) {
        fraudScore += 0.3;
        riskFactors.push('TOR network detected');
      }
      if (ipData.bot_status) {
        fraudScore += 0.25;
        riskFactors.push('Bot activity detected');
      }
      if (ipData.recent_abuse) {
        fraudScore += 0.2;
        riskFactors.push('Recent abuse detected');
      }

      // High-value transaction risk adjustment
      if (amount > 1000) {
        fraudScore += 0.1;
        riskFactors.push('High value transaction');
      }
      if (amount > 5000) {
        fraudScore += 0.1;
        riskFactors.push('Very high value transaction');
      }
    } else {
      console.error('IPQS API error:', ipData.message);
      // Use conservative fraud score if API fails
      fraudScore = 0.3;
      riskFactors.push('API verification failed');
    }

    // Normalize fraud score to 0-1 range
    fraudScore = Math.min(fraudScore, 1);

    console.log(`Final fraud score: ${fraudScore}, Risk factors: ${riskFactors.join(', ')}`);

    // Return comprehensive fraud detection results
    return new Response(
      JSON.stringify({
        success: true,
        fraud_score: fraudScore,
        risk_level: fraudScore > 0.7 ? 'high' : fraudScore > 0.4 ? 'medium' : 'low',
        ip_address: clientIP,
        country: ipData.country_code || 'Unknown',
        region: ipData.region || 'Unknown',
        city: ipData.city || 'Unknown',
        proxy: ipData.proxy || false,
        vpn: ipData.vpn || false,
        tor: ipData.tor || false,
        bot_status: ipData.bot_status || false,
        recent_abuse: ipData.recent_abuse || false,
        risk_factors: riskFactors,
        connection_type: ipData.connection_type || 'Unknown',
        isp: ipData.ISP || 'Unknown'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error(`Error in fraud-check function: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        fraud_score: 0 // Safe fallback
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
