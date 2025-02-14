
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { AddTeamDialog } from "./AddTeamDialog";
import { EditTeamDialog } from "./EditTeamDialog";
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Team {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  teams: Team[];
}

interface GroupsTableProps {
  groups: Group[];
  onAddTeam: (groupId: string, name: string) => void;
}

export function GroupsTable({ groups, onAddTeam }: GroupsTableProps) {
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const handleAddTeam = (name: string) => {
    if (selectedGroup) {
      onAddTeam(selectedGroup.id, name);
    }
  };

  const handleEditTeam = async (teamId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ name: newName })
        .eq('id', teamId);

      if (error) throw error;

      toast.success("Team updated successfully");
      queryClient.invalidateQueries({ queryKey: ['client_groups'] });
      setIsEditTeamDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating team:", error);
      toast.error(error.message || "Failed to update team");
    }
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast.success("Team deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['client_groups'] });
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast.error(error.message || "Failed to delete team");
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {groups?.map((group) => (
          <Card key={group.id} className="overflow-hidden border border-gray-200">
            <Collapsible
              open={expandedGroups.has(group.id)}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <div className="p-4 flex items-center justify-between bg-gray-50/80 border-b">
                <div className="flex items-center gap-3">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      {expandedGroups.has(group.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <div className="w-[200px]">
                    <div className="font-medium flex items-center gap-2 text-gray-900">
                      {group.name}
                      {group.is_default && (
                        <Badge variant="secondary" className="ml-2">Default</Badge>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-[100px] text-center">
                    <Badge variant="secondary">
                      {group.teams?.length || 0} teams
                    </Badge>
                  </div>
                  <div className="w-[100px] flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGroup(group);
                            setIsTeamDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Team
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Add a new team to {group.name}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <CollapsibleContent>
                <div className="p-4">
                  {group.teams && group.teams.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50/50">
                          <TableHead className="text-left w-[200px]">Team Name</TableHead>
                          <TableHead className="text-center w-[100px]">Members</TableHead>
                          <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.teams.map((team) => (
                          <TableRow key={team.id} className="hover:bg-gray-50/50">
                            <TableCell className="text-left font-medium w-[200px]">
                              {team.name}
                            </TableCell>
                            <TableCell className="text-center w-[100px]">
                              <Badge variant="secondary" className="mx-auto">0</Badge>
                            </TableCell>
                            <TableCell className="text-right w-[100px]">
                              <div className="flex justify-end gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setSelectedTeam(team);
                                        setIsEditTeamDialogOpen(true);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Edit team
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => handleDeleteTeam(team.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Delete team
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-lg">
                      No teams yet. Click "Add Team" to create one.
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {selectedGroup && (
          <AddTeamDialog
            isOpen={isTeamDialogOpen}
            onOpenChange={(open) => {
              setIsTeamDialogOpen(open);
              if (!open) setSelectedGroup(null);
            }}
            onSubmit={handleAddTeam}
            groupName={selectedGroup.name}
          />
        )}

        <EditTeamDialog
          isOpen={isEditTeamDialogOpen}
          onOpenChange={(open) => {
            setIsEditTeamDialogOpen(open);
            if (!open) setSelectedTeam(null);
          }}
          onSubmit={handleEditTeam}
          team={selectedTeam}
        />
      </div>
    </TooltipProvider>
  );
}
