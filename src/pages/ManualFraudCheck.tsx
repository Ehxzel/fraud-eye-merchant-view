
import { Link } from 'react-router-dom';
import ManualTransactionForm from '@/components/ManualTransactionForm';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const ManualFraudCheck = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manual Fraud Check</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Homepage
          </Link>
        </Button>
      </div>
      <ManualTransactionForm />
    </div>
  );
};

export default ManualFraudCheck;
