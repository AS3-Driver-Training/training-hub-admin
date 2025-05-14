
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Team } from "../types";

interface TeamSelectProps {
  selectedGroup: string | null;
  selectedTeam: string | null;
  onTeamChange: (value: string | null) => void;
  availableTeams: Array<{ id: string; name: string; group_id: string }>;
}

export function TeamSelect({ 
  selectedGroup, 
  selectedTeam, 
  onTeamChange,
  availableTeams 
}: TeamSelectProps) {
  console.log("TeamSelect rendered with:", { 
    selectedGroup, 
    selectedTeam, 
    availableTeamsCount: availableTeams.length 
  });
  
  const handleTeamChange = (value: string) => {
    console.log("Team changed to:", value);
    onTeamChange(value);
  };
  
  const placeholderText = !selectedGroup 
    ? "Select a group first" 
    : availableTeams.length === 0 
      ? "No teams available" 
      : "Select a team";
  
  return (
    <div>
      <Label>Team</Label>
      <Select 
        value={selectedTeam || undefined}
        onValueChange={handleTeamChange}
        disabled={!selectedGroup || availableTeams.length === 0}
      >
        <SelectTrigger className="w-full z-50">
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent className="z-[100]">
          <SelectGroup>
            {availableTeams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
            {selectedGroup && availableTeams.length === 0 && (
              <SelectItem value="no-teams" disabled>No teams available for this group</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
