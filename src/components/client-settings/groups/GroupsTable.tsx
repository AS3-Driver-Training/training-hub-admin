
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
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { AddTeamDialog } from "./AddTeamDialog";
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
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleAddTeam = (name: string) => {
    if (selectedGroup) {
      onAddTeam(selectedGroup.id, name);
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
                  <div>
                    <div className="font-medium flex items-center gap-2 text-gray-900">
                      {group.name}
                      {group.is_default && (
                        <Badge variant="secondary" className="ml-2">Default</Badge>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
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
                      className="ml-4"
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

              <CollapsibleContent>
                <div className="p-4">
                  {group.teams && group.teams.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50/50">
                          <TableHead className="w-[60%]">Team Name</TableHead>
                          <TableHead className="w-[20%] text-center">Members</TableHead>
                          <TableHead className="w-[20%]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.teams.map((team) => (
                          <TableRow key={team.id} className="hover:bg-gray-50/50">
                            <TableCell className="font-medium">{team.name}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="mx-auto">0</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {/* Future actions like edit, delete, etc. */}
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
      </div>
    </TooltipProvider>
  );
}

