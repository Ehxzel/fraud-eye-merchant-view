
import React from "react";
import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { success } = await signOut();
    if (success) {
      toast({
        title: "Logged out successfully",
      });
      navigate("/login");
    }
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "M";

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
              {userInitial}
            </div>
            <span className="text-sm font-medium">
              {user?.email || "Merchant Account"}
            </span>
          </div>
          {user && (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
