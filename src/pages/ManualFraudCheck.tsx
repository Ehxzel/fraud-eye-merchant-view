
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import ManualTransactionForm from '@/components/ManualTransactionForm';

const ManualFraudCheck = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Manual Fraud Check</h1>
      <ManualTransactionForm />
    </div>
  );
};

export default ManualFraudCheck;
