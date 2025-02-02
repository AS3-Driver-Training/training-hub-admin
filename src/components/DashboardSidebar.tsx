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

interface MenuItem {
  title: string;
  icon: any;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Clients",
    icon: Users,
    path: "/clients",
    roles: ["superadmin"],
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

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const filteredMenuItems = menuItems.filter(
    item => !item.roles || item.roles.includes(userRole)
  );

  return (
    <Sidebar>
      <div className="flex items-center justify-end p-4">
        <SidebarTrigger>
          <ChevronLeft className="h-4 w-4 text-primary" />
        </SidebarTrigger>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
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