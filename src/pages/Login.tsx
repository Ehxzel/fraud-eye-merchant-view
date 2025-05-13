
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Login = () => {
  const navigate = useNavigate();

  // Auto-redirect to dashboard without login
  React.useEffect(() => {
    // Automatically navigate to the dashboard
    navigate("/");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-600">FraudEye</h1>
          <p className="text-slate-500 mt-2">Merchant Dashboard</p>
        </div>
        <div className="text-center">
          <p>Redirecting to dashboard...</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
