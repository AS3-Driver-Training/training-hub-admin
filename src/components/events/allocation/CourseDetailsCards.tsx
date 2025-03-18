
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CourseDetailsCardsProps {
  courseInstance: any;
  remainingSeats: number;
  maxStudents: number;
  allocationPercentage: number;
}

export function CourseDetailsCards({ 
  courseInstance, 
  remainingSeats, 
  maxStudents, 
  allocationPercentage 
}: CourseDetailsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Status Card */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
          <p className="text-lg font-semibold mb-4">Current event status</p>
          <Badge className="bg-primary text-white">Scheduled</Badge>
        </CardContent>
      </Card>

      {/* Available Seats Card */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Seats</h3>
          <p className="text-sm text-muted-foreground mb-2">Seats remaining for this session</p>
          
          <div className="flex items-baseline mb-2">
            <span className="text-3xl font-bold">{remainingSeats}</span>
            <span className="text-lg text-muted-foreground ml-1">/{maxStudents}</span>
          </div>
          
          <Progress 
            value={allocationPercentage} 
            className="h-2 bg-muted"
            style={{ 
              '--progress-color': allocationPercentage >= 90 ? '#ef4444' : 
                                allocationPercentage >= 70 ? '#f59e0b' : 
                                '#10b981'
            } as React.CSSProperties}
          />
        </CardContent>
      </Card>

      {/* Duration Card */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Duration</h3>
          <p className="text-sm text-muted-foreground mb-2">Length of training</p>
          
          {courseInstance && (
            <>
              <p className="text-3xl font-bold mb-2">
                {Math.ceil((new Date(courseInstance.end_date).getTime() - new Date(courseInstance.start_date).getTime()) / (1000 * 60 * 60 * 24)) || 1} Days
              </p>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>08:00 - 17:00</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
