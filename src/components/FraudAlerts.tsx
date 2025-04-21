
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Alert = {
  id: string;
  message: string;
  time: string;
  severity: "high" | "medium" | "low";
};

type FraudAlertsProps = {
  isLoading: boolean;
  alerts: Alert[];
};

const FraudAlerts: React.FC<FraudAlertsProps> = ({ isLoading, alerts }) => {
  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 text-red-700";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "low":
        return "bg-blue-50 border-blue-200 text-blue-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        Array(3).fill(0).map((_, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-md border border-slate-200">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))
      ) : alerts.length > 0 ? (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start space-x-3 p-3 rounded-md border ${getSeverityColor(alert.severity)}`}
          >
            <CircleAlert className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">{alert.message}</p>
              <div className="flex items-center mt-1">
                <p className="text-xs opacity-70">{alert.time}</p>
                <Badge variant="outline" className={`ml-2 text-xs ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-slate-500">
          <CircleAlert className="mx-auto h-8 w-8 mb-2 text-slate-400" />
          <p>No alerts found</p>
        </div>
      )}
    </div>
  );
};

export default FraudAlerts;
