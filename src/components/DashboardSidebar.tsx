
import {
  Users,
  LayoutDashboard,
  Calendar,
  Settings,
  BookOpen,
  Building,
  GraduationCap,
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
    path: "/dashboard",
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
    title: "Students",
    icon: GraduationCap,
    path: "/students/list",
  },
  {
    title: "Programs",
    icon: BookOpen,
    path: "/programs",
  },
  {
    title: "Venues",
    icon: Building,
    path: "/venues",
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
    <Sidebar className="h-[calc(100%-5rem)] top-20">
      <SidebarContent className="px-4">
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
