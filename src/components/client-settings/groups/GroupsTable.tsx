
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
    <div className="space-y-4">
      {groups?.map((group) => (
        <Card key={group.id} className="overflow-hidden">
          <Collapsible
            open={expandedGroups.has(group.id)}
            onOpenChange={() => toggleGroup(group.id)}
          >
            <div className="p-4 flex items-center justify-between bg-muted/50">
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {group.name}
                    {group.is_default && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
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
            </div>

            <CollapsibleContent>
              <div className="p-4 pt-0 mt-4">
                {group.teams && group.teams.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead className="w-[100px]">Members</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.teams.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell>{team.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">0</Badge>
                          </TableCell>
                          <TableCell>
                            {/* Future actions like edit, delete, etc. */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
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
  );
}
