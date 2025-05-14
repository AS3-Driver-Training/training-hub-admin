
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { UserData, Group } from "../types";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  clientId: string;
  groups?: Group[];
}

type UserRole = 'client_admin' | 'manager' | 'supervisor';
type UserStatus = 'active' | 'pending' | 'invited' | 'inactive' | 'suspended';

export function EditUserDialog({ 
  isOpen, 
  onOpenChange, 
  user, 
  clientId,
  groups = []
}: EditUserDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'supervisor' as UserRole,
    status: 'active' as UserStatus,
  });
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.profiles.first_name || '',
        lastName: user.profiles.last_name || '',
        email: user.email || '',
        role: user.role as UserRole,
        status: user.status as UserStatus,
      });
      
      setSelectedGroups(user.groups.map(g => g.id));
      setSelectedTeams(user.teams.map(t => t.id));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(current => 
      current.includes(groupId)
        ? current.filter(id => id !== groupId)
        : [...current, groupId]
    );
    
    // If removing a group, also remove its teams
    if (selectedGroups.includes(groupId)) {
      const teamsInGroup = groups
        .find(g => g.id === groupId)?.teams
        .map(t => t.id) || [];
      
      setSelectedTeams(current => 
        current.filter(id => !teamsInGroup.includes(id))
      );
    }
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(current => 
      current.includes(teamId)
        ? current.filter(id => id !== teamId)
        : [...current, teamId]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      console.log("Updating user:", {
        id: user.id,
        formData,
        selectedGroups,
        selectedTeams
      });
      
      // In a real app, this would call Supabase
      // For now, we'll simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local cache to simulate the change
      queryClient.setQueryData(['client_users', clientId], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((u: UserData) => {
          if (u.id === user.id) {
            // Find the full group objects
            const updatedGroups = groups.filter(g => 
              selectedGroups.includes(g.id)
            );
            
            // Find the full team objects
            const updatedTeams = groups.flatMap(g => 
              g.teams.filter(t => selectedTeams.includes(t.id))
            );
            
            return {
              ...u,
              role: formData.role,
              status: formData.status,
              email: formData.email,
              profiles: {
                ...u.profiles,
                first_name: formData.firstName,
                last_name: formData.lastName
              },
              groups: updatedGroups,
              teams: updatedTeams
            };
          }
          return u;
        });
      });
      
      toast.success("User updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: UserRole) => handleInputChange('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client_admin">Client Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: UserStatus) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="access" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Groups */}
              <div className="space-y-2">
                <Label className="text-sm">Groups</Label>
                <ScrollArea className="h-[240px] rounded-md border">
                  <div className="p-2 space-y-1">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer",
                          selectedGroups.includes(group.id) ? "bg-accent" : "hover:bg-muted"
                        )}
                        onClick={() => toggleGroup(group.id)}
                      >
                        <div className={cn(
                          "rounded-sm h-4 w-4 border flex items-center justify-center",
                          selectedGroups.includes(group.id) 
                            ? "bg-primary border-primary" 
                            : "border-input"
                        )}>
                          {selectedGroups.includes(group.id) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="flex-1">{group.name}</span>
                        {group.is_default && (
                          <span className="text-xs text-muted-foreground">Default</span>
                        )}
                      </div>
                    ))}
                    {groups.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No groups available
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Teams */}
              <div className="space-y-2">
                <Label className="text-sm">Teams</Label>
                <ScrollArea className="h-[240px] rounded-md border">
                  <div className="p-2 space-y-1">
                    {groups
                      .filter(group => selectedGroups.includes(group.id))
                      .flatMap(group => (
                        <div key={group.id} className="mb-2">
                          <div className="text-xs font-medium text-muted-foreground px-3 py-1">
                            {group.name}
                          </div>
                          {group.teams.map(team => (
                            <div
                              key={team.id}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer ml-2",
                                selectedTeams.includes(team.id) ? "bg-accent" : "hover:bg-muted"
                              )}
                              onClick={() => toggleTeam(team.id)}
                            >
                              <div className={cn(
                                "rounded-sm h-4 w-4 border flex items-center justify-center",
                                selectedTeams.includes(team.id) 
                                  ? "bg-primary border-primary" 
                                  : "border-input"
                              )}>
                                {selectedTeams.includes(team.id) && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span>{team.name}</span>
                            </div>
                          ))}
                          {group.teams.length === 0 && (
                            <div className="px-3 py-1 text-xs text-muted-foreground ml-2">
                              No teams in this group
                            </div>
                          )}
                          <Separator className="my-1" />
                        </div>
                      ))}
                    {selectedGroups.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        Select a group first to see teams
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
