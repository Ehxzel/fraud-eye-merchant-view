
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { checkFraud } from '@/lib/ipqs';
import { supabase } from '@/lib/supabase'; // Fixed import path
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { FraudCheckParams } from '@/lib/ipqs';
import { Tables, PostgrestResponse } from '@/lib/database.types';
import { Info, CircleX, Check } from 'lucide-react';

// Form schema with validation
const formSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be greater than 0",
  }),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  ip_address: z.string().min(1, "IP address is required")
    .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address format"),
  billing_first_name: z.string().optional(),
  billing_last_name: z.string().optional(),
  billing_phone: z.string().optional(),
  billing_address: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_zip: z.string().optional(),
  billing_country: z.string().optional(),
  payment_method: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FraudResult {
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  message?: string;
  proxy?: boolean;
  vpn?: boolean;
  tor?: boolean;
}

// Helper type for Supabase responses
type SupabaseResponse<T> = {
  data: T | null;
  error: any;
};

const ManualTransactionForm = () => {
  const { user } = useAuth();
  const [result, setResult] = useState<FraudResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      email: '',
      ip_address: '192.168.1.1', // Default placeholder
      billing_first_name: '',
      billing_last_name: '',
      billing_phone: '',
      billing_address: '',
      billing_city: '',
      billing_state: '',
      billing_zip: '',
      billing_country: '',
      payment_method: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Prepare parameters for fraud check
      const params: FraudCheckParams = {
        amount: Number(data.amount),
        timestamp: new Date(),
        user_id: user.id,
        userEmail: data.email,
        userIp: data.ip_address,
        billing_address: {
          street: data.billing_address || '',
          city: data.billing_city || '',
          state: data.billing_state || '',
          zip: data.billing_zip || '',
          country: data.billing_country || '',
        },
        phone: data.billing_phone,
        payment_method: data.payment_method,
      };

      // Call fraud detection API
      const fraudScore = await checkFraud(params);
      
      // Determine risk level based on score
      let riskLevel: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
      if (fraudScore <= 0.3) riskLevel = 'low';
      else if (fraudScore <= 0.7) riskLevel = 'medium';
      else riskLevel = 'high';

      setResult({
        fraudScore,
        riskLevel,
        proxy: fraudScore > 0.5, // Simulated data - in real implementation would come from API
        vpn: fraudScore > 0.7,   // Simulated data
        tor: fraudScore > 0.8,   // Simulated data
      });

      // Store the transaction in Supabase with type casting to help TypeScript
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: Number(data.amount),
          fraud_score: fraudScore,
          status: fraudScore > 0.8 ? 'blocked' : fraudScore > 0.5 ? 'flagged' : 'approved'
        })
        .select()
        .single() as PostgrestResponse<Tables['transactions']>;

      if (error) {
        console.error("Failed to store transaction:", error);
        toast({
          title: "Database Error",
          description: "Failed to store transaction result",
          variant: "destructive",
        });
        return;
      }

      if (!transaction) {
        console.error("No transaction data returned");
        return;
      }

      // Create fraud alert for high-risk transactions
      if (fraudScore > 0.7) {
        await supabase
          .from('fraud_alerts')
          .insert({
            transaction_id: transaction.id,
            alert_type: `High Fraud Risk (Manual Check: ${(fraudScore * 100).toFixed(0)}%)`,
          }) as PostgrestResponse<null>;
      }

      toast({
        title: "Fraud Check Complete",
        description: `Transaction analyzed with a risk score of ${(fraudScore * 100).toFixed(0)}%`,
      });

    } catch (err) {
      console.error("Fraud check error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to process fraud check",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setResult(null);
  };

  // Helper function to get appropriate color for risk level
  const getRiskColor = (score: number): string => {
    if (score > 0.7) return "text-red-500";
    if (score > 0.4) return "text-amber-500";
    return "text-green-500";
  };

  // Helper function to get appropriate icon for risk level
  const getRiskIcon = (score: number) => {
    if (score > 0.7) return <CircleX className="h-5 w-5 text-red-500" />;
    if (score > 0.4) return <Info className="h-5 w-5 text-amber-500" />;
    return <Check className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Manual Fraud Check</CardTitle>
          <CardDescription>
            Enter transaction details to analyze potential fraud risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Required Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)*</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="100.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ip_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IP Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="192.168.1.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <Input placeholder="credit_card" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <h3 className="text-lg font-medium pt-2">Billing Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billing_first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP/Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="US" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Check Fraud Risk"}
                </Button>
              </div>
            </form>
          </Form>
          
          {result && (
            <div className="mt-8 border rounded-lg p-6 bg-slate-50">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                {getRiskIcon(result.fraudScore)}
                <span className="ml-2">Fraud Detection Results</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-medium">Risk Score:</span>
                  <span className={`text-lg font-bold ${getRiskColor(result.fraudScore)}`}>
                    {Math.round(result.fraudScore * 100)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-medium">Risk Level:</span>
                  <span className={`font-medium capitalize ${getRiskColor(result.fraudScore)}`}>
                    {result.riskLevel}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Proxy Detected:</span>
                    {result.proxy ? (
                      <CircleX className="h-4 w-4 text-red-500" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium mr-2">VPN Detected:</span>
                    {result.vpn ? (
                      <CircleX className="h-4 w-4 text-red-500" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium mr-2">TOR Network:</span>
                    {result.tor ? (
                      <CircleX className="h-4 w-4 text-red-500" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  {result.fraudScore > 0.7 
                    ? "High risk detected. Transaction may be fraudulent." 
                    : result.fraudScore > 0.4 
                      ? "Medium risk detected. Consider additional verification." 
                      : "Low risk detected. Transaction appears legitimate."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualTransactionForm;
