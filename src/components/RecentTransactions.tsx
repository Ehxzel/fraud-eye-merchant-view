
import React from "react";
import { TableCell, TableRow, TableHeader, TableHead, TableBody, Table } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Transaction = {
  id: string;
  customer: string;
  amount: number;
  date: string;
  riskScore: number;
  status: "approved" | "flagged" | "blocked";
};

type RecentTransactionsProps = {
  isLoading: boolean;
  transactions: Transaction[];
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ isLoading, transactions }) => {
  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "flagged":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Flagged</Badge>;
      case "blocked":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Blocked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRiskBadge = (score: number) => {
    if (score < 25) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{score}%</Badge>;
    } else if (score < 75) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{score}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{score}%</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                {Array(6).fill(0).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                <TableCell>{transaction.customer}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{getRiskBadge(transaction.riskScore)}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentTransactions;
