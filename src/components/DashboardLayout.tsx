import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Button } from "./ui/button";
import { Menu, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("User");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, role')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profile) {
            setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User');
            setUserRole(profile.role ? (profile.role.charAt(0).toUpperCase() + profile.role.slice(1)) : 'User');
          } else {
            console.warn('No profile found for user:', user.id);
            toast.error('Unable to load user profile');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading user profile');
      }
    };
    getProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/auth");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="border-b">
            <div className="flex h-20 items-center px-4 gap-4">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 text-[#C10230]" />
              </Button>
              <img
                src="http://as3driving.com/wp-content/uploads/2020/07/AS3-Driver-Training-Logo-HiRes.png"
                alt="AS3 Driver Training"
                className="h-16"
              />
              <div className="ml-auto flex items-center space-x-4">
                <span className="text-sm font-medium text-[#C10230]">
                  {userRole}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5 text-[#C10230]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Welcome {userName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>{userRole}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}