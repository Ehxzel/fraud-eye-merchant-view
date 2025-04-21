
import React from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHeader = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="font-bold text-xl text-teal-600 mr-2">FraudEye</div>
          <span className="text-sm text-slate-500">Merchant Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Settings</span>
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-semibold">
              M
            </div>
            <span className="text-sm font-medium">Merchant Account</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
