
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ProgramWithInstances, CourseInstance } from "./hooks/useAS3Programs";

interface AS3ProgramRowProps {
  program: ProgramWithInstances;
  onInquiry: (program: ProgramWithInstances) => void;
  onEnrollment: (program: ProgramWithInstances, instance: CourseInstance) => void;
}

export function AS3ProgramRow({ program, onInquiry, onEnrollment }: AS3ProgramRowProps) {
  const getLevelBadgeColor = (level: string): string => {
    switch(level) {
      case "Basic": return "bg-blue-100 text-blue-800";
      case "Intermediate": return "bg-purple-100 text-purple-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <TableRow className="border-t">
      <TableCell>
        <div className="space-y-2">
          <div className="font-semibold text-base">{program.name}</div>
          <div className="text-sm text-muted-foreground">
            {program.description}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge 
              variant="secondary" 
              className={getLevelBadgeColor(program.lvl)}
            >
              Level {program.lvl === "Basic" ? "1" : 
                     program.lvl === "Intermediate" ? "2" : "3"}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {program.durationDays} day{program.durationDays !== 1 ? 's' : ''}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              Max {program.maxStudents} students
            </span>
            {program.price > 0 && (
              <span className="text-muted-foreground font-medium">
                ${program.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {program.upcomingInstances.length > 0 ? (
          <div className="space-y-1">
            {program.upcomingInstances.slice(0, 2).map((instance) => (
              <div key={instance.id} className="text-sm">
                <div className="font-medium">
                  {format(new Date(instance.start_date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <MapPin className="h-3 w-3" />
                  {instance.venue_name}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={instance.available_seats > 0 ? 'text-green-600' : 'text-red-600'}>
                    {instance.available_seats} seats available
                  </span>
                  {instance.available_seats > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() => onEnrollment(program, instance)}
                    >
                      Request Seats
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {program.upcomingInstances.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{program.upcomingInstances.length - 2} more sessions
              </p>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            No upcoming sessions
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onInquiry(program)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Inquire
        </Button>
      </TableCell>
    </TableRow>
  );
}
