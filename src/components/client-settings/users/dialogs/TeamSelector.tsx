
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Team } from "../../types";

interface TeamSelectorProps {
  selectedTeams: string[];
  toggleTeam: (teamId: string) => void;
  availableTeams: Team[];
}

export function TeamSelector({ selectedTeams, toggleTeam, availableTeams }: TeamSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Teams</Label>
      <ScrollArea className="h-[200px] rounded-md border">
        <div className="p-4 space-y-2">
          {availableTeams.map((team) => (
            <div
              key={team.id}
              className={cn(
                "flex items-center space-x-2 rounded-lg px-4 py-2 cursor-pointer hover:bg-accent",
                selectedTeams.includes(team.id) && "bg-accent"
              )}
              onClick={() => toggleTeam(team.id)}
            >
              <Check
                className={cn(
                  "h-4 w-4",
                  selectedTeams.includes(team.id) ? "opacity-100" : "opacity-0"
                )}
              />
              <span>{team.name}</span>
            </div>
          ))}
          {availableTeams.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              No teams available in this group
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
