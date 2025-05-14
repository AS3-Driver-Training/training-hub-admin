
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Group } from "../../types";

interface GroupSelectorProps {
  selectedGroup: string | null;
  setSelectedGroup: (groupId: string) => void;
  groups: Group[];
}

export function GroupSelector({ selectedGroup, setSelectedGroup, groups }: GroupSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Group</Label>
      <Select 
        value={selectedGroup || undefined} 
        onValueChange={setSelectedGroup}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} {group.teams?.length ? `(${group.teams.length} teams)` : ''}
              </SelectItem>
            ))}
            {groups.length === 0 && (
              <SelectItem value="no-groups" disabled>No groups available</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
