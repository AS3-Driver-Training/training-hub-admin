
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, MapPin, Users, MessageCircle, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ProgramWithInstances, CourseInstance } from "./hooks/useAS3Programs";

interface AS3ProgramRowProps {
  program: ProgramWithInstances;
  onInquiry: (program: ProgramWithInstances) => void;
  onEnrollment: (program: ProgramWithInstances, instance: CourseInstance) => void;
}

export function AS3ProgramRow({ program, onInquiry, onEnrollment }: AS3ProgramRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelBadgeColor = (level: string): string => {
    switch(level) {
      case "Basic": return "bg-blue-100 text-blue-800";
      case "Intermediate": return "bg-purple-100 text-purple-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <TableRow className="border-t">
        <TableCell>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-base">{program.name}</div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
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
              {program.upcomingInstances.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {program.upcomingInstances.length} upcoming session{program.upcomingInstances.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
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
      <CollapsibleContent>
        <TableRow>
          <TableCell colSpan={2} className="bg-muted/20 border-0">
            <div className="py-4">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Upcoming Sessions</h4>
              {program.upcomingInstances.length > 0 ? (
                <div className="space-y-3">
                  {program.upcomingInstances.map((instance) => (
                    <div key={instance.id} className="bg-background p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="font-medium">
                            {format(new Date(instance.start_date), 'MMM d, yyyy')}
                            {instance.end_date && instance.end_date !== instance.start_date && 
                              ` - ${format(new Date(instance.end_date), 'MMM d, yyyy')}`
                            }
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {instance.venue_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span className={instance.available_seats > 0 ? 'text-green-600' : 'text-red-600'}>
                                {instance.available_seats} seats available
                              </span>
                            </div>
                          </div>
                        </div>
                        {instance.available_seats > 0 && (
                          <Button
                            size="sm"
                            onClick={() => onEnrollment(program, instance)}
                          >
                            Request Seats
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4">
                  No upcoming sessions scheduled at this time.
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}
