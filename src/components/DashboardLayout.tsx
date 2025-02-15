
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { userName, userRole, isLoading } = useProfile();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/auth");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userName={userName} 
          userRole={userRole} 
          onLogout={handleLogout}
        />
        <div className="flex pt-20 fixed inset-0">
          <DashboardSidebar userRole={userRole} />
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-[1400px] px-8 py-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
