
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
import { Plus } from "lucide-react";
import { AddTeamDialog } from "./AddTeamDialog";
import { useState } from "react";

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

  const handleAddTeam = (name: string) => {
    if (selectedGroup) {
      onAddTeam(selectedGroup.id, name);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups?.map((group) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">
                {group.name}
                {group.is_default && (
                  <Badge variant="secondary" className="ml-2">
                    Default
                  </Badge>
                )}
              </TableCell>
              <TableCell className="max-w-md">
                {group.description}
              </TableCell>
              <TableCell>
                {group.teams?.map((team) => (
                  <Badge
                    key={team.id}
                    variant="outline"
                    className="mr-2"
                  >
                    {team.name}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedGroup(group);
                    setIsTeamDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
