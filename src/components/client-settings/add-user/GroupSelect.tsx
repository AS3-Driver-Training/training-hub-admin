
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
import { Group } from "../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GroupSelectProps {
  groups?: Group[];
  selectedGroup?: string | null;
  onGroupChange?: (value: string) => void;
  // Add these new props for compatibility with AddUserDialog
  value?: string;
  onChange?: (value: string) => void;
  clientId?: string;
  selectedGroupId?: string;
  onGroupChange?: (value: string) => void;
  disabled?: boolean;
}

export function GroupSelect({ 
  groups: propGroups, 
  selectedGroup, 
  onGroupChange,
  value,
  onChange,
  clientId,
  selectedGroupId,
  disabled
}: GroupSelectProps) {
  // Use the clientId to fetch groups if provided and no groups were passed as props
  const { data: fetchedGroups, isLoading } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select('*, teams(*)')
        .eq('client_id', clientId)
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId && !propGroups
  });
  
  // Use either provided groups or fetched groups
  const groups = propGroups || fetchedGroups || [];
  
  console.log("GroupSelect rendered with:", { 
    groupsCount: groups.length, 
    selectedGroup: selectedGroup || value || selectedGroupId 
  });
  
  const handleGroupChange = (newValue: string) => {
    console.log("Group changed to:", newValue);
    if (onGroupChange) onGroupChange(newValue);
    if (onChange) onChange(newValue);
  };
  
  // Use the appropriate value prop, preferring the most direct one for backward compatibility
  const currentValue = selectedGroupId !== undefined ? selectedGroupId : 
                       value !== undefined ? value : 
                       selectedGroup !== undefined ? selectedGroup : undefined;
  
  return (
    <div>
      <Label>Group</Label>
      <Select 
        value={currentValue || undefined} 
        onValueChange={handleGroupChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading groups..." : "Select a group"} />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          <SelectGroup>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} {group.teams?.length ? `(${group.teams.length} teams)` : ''}
              </SelectItem>
            ))}
            {groups.length === 0 && !isLoading && (
              <SelectItem value="no-groups" disabled>No groups available</SelectItem>
            )}
            {isLoading && (
              <SelectItem value="loading" disabled>Loading groups...</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
