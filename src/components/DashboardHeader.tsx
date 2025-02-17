
import { Button } from "./ui/button";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => Promise<void>;
}

export function DashboardHeader({ userName, userRole, onLogout }: DashboardHeaderProps) {
  return (
    <div className="border-b w-full fixed top-0 left-0 right-0 bg-background z-50">
      <div className="flex h-20 items-center px-8 gap-4 max-w-[1400px] mx-auto">
        <SidebarTrigger>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-[#C10230]" />
          </Button>
        </SidebarTrigger>
        <img
          src="https://as3driving.com/wp-content/uploads/2020/07/AS3-Driver-Training-Logo-HiRes.png"
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Welcome {userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              {["superadmin", "admin", "staff"].includes(userRole) && (
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>System Settings</span>
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

