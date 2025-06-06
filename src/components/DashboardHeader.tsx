
import { Button } from "./ui/button";
import { Menu, LogOut, User, Settings, UserPlus, ArrowLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useClientBranding } from "@/contexts/ClientBrandingContext";

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => Promise<void>;
  impersonation?: {
    isImpersonating: boolean;
    originalRole: string | null;
    impersonatedClientId: string | null;
    exitImpersonation: () => void;
  };
}

export function DashboardHeader({ userName, userRole, onLogout, impersonation }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { branding, isLoading } = useClientBranding();

  const handleExitImpersonation = () => {
    if (impersonation?.exitImpersonation) {
      impersonation.exitImpersonation();
      navigate('/clients');
    }
  };

  // Determine if user should see internal settings
  const isInternalUser = ["superadmin", "admin", "staff"].includes(userRole);
  const showInternalSettings = isInternalUser && !impersonation?.isImpersonating;

  // Logo logic: Use client logo if available and impersonating, otherwise use AS3 logo
  const shouldUseClientLogo = impersonation?.isImpersonating && branding.logoUrl;
  const displayLogo = shouldUseClientLogo 
    ? branding.logoUrl 
    : "https://as3driving.com/wp-content/uploads/2020/07/AS3-Driver-Training-Logo-HiRes.png";
  const logoAlt = shouldUseClientLogo ? (branding.clientName || "Client Logo") : "AS3 Driver Training";

  // Colors: Use client colors if available and impersonating
  const primaryColor = impersonation?.isImpersonating && branding.primaryColor 
    ? branding.primaryColor 
    : '#C10230';

  return (
    <div className="border-b w-full fixed top-0 left-0 right-0 bg-background z-50">
      <div className="flex h-20 items-center px-8 gap-4 max-w-[1400px] mx-auto">
        <SidebarTrigger>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" style={{ color: primaryColor }} />
          </Button>
        </SidebarTrigger>
        
        <div className="flex items-center gap-2">
          <img
            src={displayLogo}
            alt={logoAlt}
            className="h-16"
          />
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {impersonation?.isImpersonating && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-md">
              <span className="text-sm text-yellow-800 font-medium">
                Viewing as Client Admin
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleExitImpersonation}
                className="text-yellow-800 hover:text-yellow-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Exit
              </Button>
            </div>
          )}
          <span 
            className="text-sm font-medium"
            style={{ color: primaryColor }}
          >
            {userRole}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User 
                  className="h-5 w-5" 
                  style={{ color: primaryColor }}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Welcome {userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              {showInternalSettings && (
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>System Settings</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {userRole === "superadmin" && !impersonation?.isImpersonating && (
                <DropdownMenuItem asChild>
                  <Link to="/manual-activate-user" className="w-full flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Manually Activate User</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
