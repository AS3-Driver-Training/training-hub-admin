
import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamSelectProps {
  selectedGroup?: string | null;
  selectedTeam?: string | null;
  onTeamChange?: (value: string | null) => void;
  availableTeams?: Array<{ id: string; name: string; group_id: string }>;
  // For backward compatibility
  teams?: Array<{ id: string; name: string; group_id: string }>;
  value?: string | null;
  onChange?: (value: string | null) => void;
  // New props for the AddUserDialog
  groupId?: string;
  selectedTeamIds?: string[];
  onTeamsChange?: (value: string[]) => void;
  disabled?: boolean;
}

export function TeamSelect({ 
  selectedGroup, 
  selectedTeam, 
  onTeamChange,
  availableTeams,
  // Support for old props
  teams,
  value,
  onChange,
  // Support for new props
  groupId,
  selectedTeamIds,
  onTeamsChange,
  disabled
}: TeamSelectProps) {
  const [multipleTeams, setMultipleTeams] = useState<string[]>([]);
  
  // Fetch teams if groupId is provided
  const { data: fetchedTeams, isLoading } = useQuery({
    queryKey: ['group_teams', groupId || selectedGroup],
    queryFn: async () => {
      const targetGroupId = groupId || selectedGroup;
      if (!targetGroupId) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('group_id', targetGroupId)
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!(groupId || selectedGroup) && !teams && !availableTeams
  });
  
  // Use either provided teams or fetched teams
  const teamsToUse = availableTeams || teams || fetchedTeams || [];
  const teamValue = selectedTeam || value || null;
  
  // For multiple teams selection
  useEffect(() => {
    if (selectedTeamIds) {
      setMultipleTeams(selectedTeamIds);
    }
  }, [selectedTeamIds]);
  
  // Determine if we're in multiple selection mode
  const isMultipleSelection = selectedTeamIds !== undefined && onTeamsChange !== undefined;
  
  const handleSingleTeamChange = (value: string) => {
    console.log("Single team changed to:", value);
    if (onChange) onChange(value);
    if (onTeamChange) onTeamChange(value);
  };
  
  const handleMultiTeamChange = (value: string) => {
    console.log("Multiple team selection changed:", value);
    const updatedTeams = multipleTeams.includes(value)
      ? multipleTeams.filter(id => id !== value)
      : [...multipleTeams, value];
    
    setMultipleTeams(updatedTeams);
    if (onTeamsChange) onTeamsChange(updatedTeams);
  };
  
  // If groupId/selectedGroup is being used for multiple selection
  if (isMultipleSelection) {
    return (
      <div>
        <Label>Teams</Label>
        <div className="mt-2 border rounded-md p-2 max-h-40 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-2 text-sm text-muted-foreground">Loading teams...</div>
          ) : teamsToUse.length === 0 ? (
            <div className="text-center py-2 text-sm text-muted-foreground">No teams available for this group</div>
          ) : (
            teamsToUse.map(team => (
              <div 
                key={team.id} 
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  multipleTeams.includes(team.id) ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => !disabled && handleMultiTeamChange(team.id)}
              >
                <input 
                  type="checkbox" 
                  checked={multipleTeams.includes(team.id)}
                  onChange={() => {}}
                  className="mr-2"
                  disabled={disabled}
                />
                <span>{team.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
  
  const placeholderText = !selectedGroup && !groupId
    ? "Select a group first" 
    : teamsToUse.length === 0 
      ? "No teams available" 
      : "Select a team";
  
  return (
    <div>
      <Label>Team</Label>
      <Select 
        value={teamValue || undefined}
        onValueChange={handleSingleTeamChange}
        disabled={disabled || (!selectedGroup && !groupId) || teamsToUse.length === 0 || isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading teams..." : placeholderText} />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          <SelectGroup>
            {teamsToUse.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
            {(selectedGroup || groupId) && teamsToUse.length === 0 && !isLoading && (
              <SelectItem value="no-teams" disabled>No teams available for this group</SelectItem>
            )}
            {isLoading && (
              <SelectItem value="loading" disabled>Loading teams...</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
