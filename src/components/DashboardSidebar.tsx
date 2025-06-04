import {
  Users,
  LayoutDashboard,
  Calendar,
  Settings,
  BookOpen,
  Building,
  GraduationCap,
  UsersRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useClientBranding } from "@/contexts/ClientBrandingContext";
import { PoweredByAS3 } from "@/components/branding/PoweredByAS3";

interface MenuItem {
  title: string;
  icon: any;
  path: string;
  roles?: string[];
  hideWhenImpersonating?: boolean;
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
    hideWhenImpersonating: true,
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
    title: "Groups & Teams",
    icon: UsersRound,
    path: "/groups",
    roles: ["client_admin", "supervisor", "driver"],
    hideWhenImpersonating: false,
  },
];

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const { impersonation } = useProfile();
  const { hasClientBranding } = useClientBranding();

  // Determine which settings menu item to show
  const isInternalUser = ["superadmin", "admin", "staff"].includes(userRole);
  const showInternalSettings = isInternalUser && !impersonation.isImpersonating;
  const showOrganizationSettings = !isInternalUser || impersonation.isImpersonating;

  const filteredMenuItems = menuItems.filter(
    item => {
      // Check role-based access
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }
      
      // Hide certain items when impersonating
      if (item.hideWhenImpersonating && impersonation.isImpersonating) {
        return false;
      }
      
      return true;
    }
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
                      <item.icon 
                        className="h-4 w-4" 
                        style={{ color: 'var(--client-primary-override, #9b87f5)' }}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Conditional Settings Menu */}
              {showInternalSettings && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/settings">
                      <Settings 
                        className="h-4 w-4" 
                        style={{ color: 'var(--client-primary-override, #9b87f5)' }}
                      />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {showOrganizationSettings && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/organization-settings">
                      <Settings 
                        className="h-4 w-4" 
                        style={{ color: 'var(--client-primary-override, #9b87f5)' }}
                      />
                      <span>Organization Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {hasClientBranding && (
        <SidebarFooter className="px-4 py-2">
          <PoweredByAS3 />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
