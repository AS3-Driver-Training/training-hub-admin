
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
  selectedGroup?: string | null;
  selectedTeam?: string | null;
  onTeamChange?: (value: string | null) => void;
  availableTeams?: Array<{ id: string; name: string; group_id: string }>;
  // For backward compatibility
  teams?: Array<{ id: string; name: string; group_id: string }>;
  value?: string | null;
  onChange?: (value: string | null) => void;
}

export function TeamSelect({ 
  selectedGroup, 
  selectedTeam, 
  onTeamChange,
  availableTeams,
  // Support for old props
  teams,
  value,
  onChange
}: TeamSelectProps) {
  // Use either new or old prop pattern
  const teamsToUse = availableTeams || teams || [];
  const teamValue = selectedTeam || value || null;
  const handleChange = onTeamChange || onChange || (() => {});
  
  console.log("TeamSelect rendered with:", { 
    selectedGroup, 
    teamValue, 
    teamsCount: teamsToUse.length 
  });
  
  const handleTeamChange = (value: string) => {
    console.log("Team changed to:", value);
    handleChange(value);
  };
  
  const placeholderText = !selectedGroup 
    ? "Select a group first" 
    : teamsToUse.length === 0 
      ? "No teams available" 
      : "Select a team";
  
  return (
    <div>
      <Label>Team</Label>
      <Select 
        value={teamValue || undefined}
        onValueChange={handleTeamChange}
        disabled={(!selectedGroup && !teams) || teamsToUse.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          <SelectGroup>
            {teamsToUse.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
            {selectedGroup && teamsToUse.length === 0 && (
              <SelectItem value="no-teams" disabled>No teams available for this group</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
