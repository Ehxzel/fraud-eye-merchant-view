
import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="w-full">
      <div className="container mx-auto py-4">
        <Button variant="outline" className="mb-4" asChild>
          <Link to="/manual-fraud-check">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Manual Fraud Check
          </Link>
        </Button>
      </div>
      <Dashboard />
    </div>
  );
};

export default Index;
