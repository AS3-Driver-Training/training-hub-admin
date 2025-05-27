
import { Badge } from "@/components/ui/badge";
import { getActivityStatus } from "@/utils/countries";

interface ActivityStatusProps {
  lastActivity: string | null;
  activeUsers: number;
}

export function ActivityStatus({ lastActivity, activeUsers }: ActivityStatusProps) {
  const status = getActivityStatus(lastActivity);
  
  const variants = {
    active: "success" as const,
    warning: "warning" as const,
    inactive: "destructive" as const,
  };

  const labels = {
    active: "Active",
    warning: "Low Activity", 
    inactive: "Inactive",
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
      {activeUsers > 0 && (
        <span className="text-xs text-muted-foreground">
          {activeUsers} users
        </span>
      )}
    </div>
  );
}
