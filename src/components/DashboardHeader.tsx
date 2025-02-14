
import { Button } from "./ui/button";
import { Menu, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfileDialog } from "./UserProfileDialog";

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => Promise<void>;
}

export function DashboardHeader({ userName, userRole, onLogout }: DashboardHeaderProps) {
  return (
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
              <UserProfileDialog />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Welcome {userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>{userRole}</span>
              </DropdownMenuItem>
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
