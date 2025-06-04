
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, MessageCircle, ChevronDown, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { ProgramWithInstances, CourseInstance } from "./hooks/useAS3Programs";

interface AS3ProgramCardProps {
  program: ProgramWithInstances;
  onInquiry: (program: ProgramWithInstances) => void;
  onEnrollment: (program: ProgramWithInstances, instance: CourseInstance) => void;
}

export function AS3ProgramCard({ program, onInquiry, onEnrollment }: AS3ProgramCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelBadgeColor = (level: string): string => {
    switch(level) {
      case "Basic": return "bg-blue-100 text-blue-800";
      case "Intermediate": return "bg-purple-100 text-purple-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleInquiryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInquiry(program);
  };

  const handleEnrollmentClick = (e: React.MouseEvent, instance: CourseInstance) => {
    e.stopPropagation();
    onEnrollment(program, instance);
  };

  return (
    <Card className="w-full cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardContent className="p-6">
        {/* Main Program Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold">{program.name}</h3>
              <Badge 
                variant="secondary" 
                className={getLevelBadgeColor(program.lvl)}
              >
                Level {program.lvl === "Basic" ? "1" : 
                       program.lvl === "Intermediate" ? "2" : "3"}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">{program.description}</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {program.durationDays} day{program.durationDays !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Max {program.maxStudents} students
              </div>
              {program.price > 0 && (
                <div className="flex items-center gap-1 font-medium">
                  <DollarSign className="h-4 w-4" />
                  {program.price.toLocaleString()}
                </div>
              )}
              {program.upcomingInstances.length > 0 && (
                <div className="text-green-600 font-medium">
                  {program.upcomingInstances.length} upcoming session{program.upcomingInstances.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleInquiryClick}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Inquire
            </Button>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            {/* Upcoming Sessions */}
            <div>
              <h4 className="font-medium mb-3">Upcoming Sessions</h4>
              {program.upcomingInstances.length > 0 ? (
                <div className="grid gap-3">
                  {program.upcomingInstances.map((instance) => (
                    <div key={instance.id} className="border rounded-lg p-4 bg-muted/20">
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
                            onClick={(e) => handleEnrollmentClick(e, instance)}
                          >
                            Request Seats
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/10">
                  No upcoming sessions scheduled at this time.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
