
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Group } from "../types";

interface TeamSelectProps {
  selectedGroup: string | null;
  selectedTeam: string | null;
  onTeamChange: (value: string | null) => void;
  availableTeams: Array<{ id: string; name: string }>;
}

export function TeamSelect({ 
  selectedGroup, 
  selectedTeam, 
  onTeamChange,
  availableTeams 
}: TeamSelectProps) {
  return (
    <div>
      <Label>Team</Label>
      <Select 
        value={selectedTeam || undefined}
        onValueChange={onTeamChange}
        disabled={!selectedGroup || availableTeams.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={
            !selectedGroup 
              ? "Select a group first" 
              : availableTeams.length === 0 
                ? "No teams available" 
                : "Select a team"
          } />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {availableTeams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
