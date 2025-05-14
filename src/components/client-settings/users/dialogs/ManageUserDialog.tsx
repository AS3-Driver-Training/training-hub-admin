
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserData, Group } from "../../types";
import { RoleSelector } from "./RoleSelector";
import { GroupSelector } from "./GroupSelector";
import { TeamSelector } from "./TeamSelector";
import { useUserManager } from "./UserManager";

interface ManageUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  clientId: string;
  groups: Group[];
}

export function ManageUserDialog({ 
  isOpen, 
  onOpenChange, 
  user, 
  clientId,
  groups = []
}: ManageUserDialogProps) {
  const {
    selectedRole,
    setSelectedRole,
    selectedGroup,
    setSelectedGroup,
    selectedTeams,
    toggleTeam,
    handleUpdateUser,
    getAvailableTeams
  } = useUserManager(user, clientId);
  
  const [isSaving, setIsSaving] = useState(false);
  
  const availableTeams = getAvailableTeams(groups);
  
  const onSave = async () => {
    setIsSaving(true);
    const success = await handleUpdateUser();
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RoleSelector 
            selectedRole={selectedRole} 
            setSelectedRole={setSelectedRole} 
          />

          <GroupSelector 
            selectedGroup={selectedGroup} 
            setSelectedGroup={setSelectedGroup}
            groups={groups}
          />

          <TeamSelector 
            selectedTeams={selectedTeams}
            toggleTeam={toggleTeam}
            availableTeams={availableTeams}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
