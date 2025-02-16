
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { userName, userRole, isLoading } = useProfile();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
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
