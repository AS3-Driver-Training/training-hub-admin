
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserData } from "../types";

interface UserGroupsTeamsProps {
  user: UserData;
  clientId: string;
  onManageAccess: () => void;
}

export function UserGroupsTeams({ user, clientId, onManageAccess }: UserGroupsTeamsProps) {
  // Check if user is assigned to the default group
  const hasDefaultGroup = user.groups.some(group => group.is_default);
  const groups = user.groups.length > 0 ? user.groups : [];
  const teams = user.teams.length > 0 ? user.teams : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groups Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Groups</h4>
          </div>
          
          {groups.length > 0 ? (
            <div className="space-y-2">
              {groups.map((group) => (
                <Card key={group.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{group.name}</div>
                      {group.description && (
                        <div className="text-xs text-muted-foreground">{group.description}</div>
                      )}
                    </div>
                    {group.is_default && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-md">
              No groups assigned
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div>
          <h4 className="text-sm font-medium mb-3">Teams</h4>
          {teams.length > 0 ? (
            <div className="space-y-2">
              {teams.map((team) => (
                <Card key={team.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{team.name}</div>
                      {team.group && (
                        <div className="text-xs text-muted-foreground">
                          {team.group.name} Group
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-md">
              No teams assigned
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline"
          onClick={onManageAccess}
          className="text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Manage Groups & Teams
        </Button>
      </div>
    </div>
  );
}
