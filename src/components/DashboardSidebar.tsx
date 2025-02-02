import {
  Users,
  LayoutDashboard,
  Calendar,
  Settings,
  ChevronLeft,
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
  return (
    <Sidebar>
      <div className="flex items-center justify-between p-4">
        <img src="/as3-logo.png" alt="AS3 Driver Training" className="h-8" />
        <SidebarTrigger>
          <ChevronLeft className="h-4 w-4" />
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
                      <item.icon className="h-4 w-4" />
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