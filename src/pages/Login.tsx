
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { success, error } = await signIn({ email, password });
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to FraudEye Dashboard",
        });
        navigate("/");
      } else {
        const errorMsg = error?.message || "Invalid email or password";
        console.error("Login error:", errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { success, error } = await signUp({ email, password });
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: "Please check your email for confirmation. You can login immediately if email confirmation is not required.",
        });
        setEmail("");
        setPassword("");
      } else {
        const errorMsg = error?.message || "Could not create account";
        console.error("Registration error:", errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(error?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-600">FraudEye</h1>
          <p className="text-slate-500 mt-2">Merchant Dashboard</p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email-login" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email-login"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password-login" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password-login"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-slate-500">
                Demo credentials: demo@fraudeye.com / demo123
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email-register" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email-register"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password-register" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password-register"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password (min. 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-slate-500">
                After registration, check your email for confirmation
              </p>
              <p className="text-slate-500 mt-1">
                (You may be able to login immediately if email confirmation is disabled)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
