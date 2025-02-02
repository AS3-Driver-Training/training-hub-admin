import {
  Users,
  LayoutDashboard,
  Calendar,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Users",
    icon: Users,
    path: "/users",
  },
  {
    title: "Training Events",
    icon: Calendar,
    path: "/events",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export function DashboardSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/auth");
    }
  };

  return (
    <Sidebar>
      <div className="flex items-center justify-between p-4">
        <img
          src="http://as3driving.com/wp-content/uploads/2020/07/AS3-Driver-Training-Logo-HiRes.png"
          alt="AS3 Driver Training"
          className="h-8"
        />
        <SidebarTrigger>
          <ChevronLeft className="h-4 w-4 text-primary" />
        </SidebarTrigger>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4 text-primary" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}