
import { Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CourseDetailsCardsProps {
  courseInstance: any;
  remainingSeats: number;
  maxStudents: number;
  allocationPercentage: number;
  courseStatus: string;
}

export function CourseDetailsCards({ 
  courseInstance, 
  remainingSeats, 
  maxStudents, 
  allocationPercentage,
  courseStatus
}: CourseDetailsCardsProps) {
  // Calculate course duration properly
  const calculateDuration = () => {
    if (!courseInstance) return 1; // Default to 1 day if no course instance

    const startDate = new Date(courseInstance.start_date);
    
    // If end_date is null, default to 1 day
    if (!courseInstance.end_date) {
      return 1;
    }
    
    const endDate = new Date(courseInstance.end_date);
    
    // Calculate the difference in days and add 1 (to include both start and end day)
    const days = differenceInDays(endDate, startDate);
    return Math.max(1, days + 1); // Ensure minimum of 1 day
  };

  const durationDays = calculateDuration();

  // Get badge styling based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "closed":
        return { variant: "success" as const, text: "Closed" };
      case "completed":
        return { variant: "warning" as const, text: "Completed" };
      case "scheduled":
        return { variant: "default" as const, text: "Scheduled" };
      default:
        return { variant: "default" as const, text: "Scheduled" };
    }
  };

  const statusBadge = getStatusBadge(courseStatus);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Status Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
          <div className="space-y-2">
            <p className="text-xl font-semibold">Current event status</p>
            <Badge 
              variant={statusBadge.variant}
              className="font-medium"
            >
              {statusBadge.text}
            </Badge>
            {courseInstance?.host_client && (
              <p className="text-sm text-muted-foreground mt-2">
                Client: <span className="font-medium">{courseInstance.host_client.name}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Seats Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Seats</h3>
          <p className="text-sm text-muted-foreground mb-2">Seats remaining for this session</p>
          
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-bold">{remainingSeats}</span>
            <span className="text-lg text-muted-foreground ml-1">/{maxStudents}</span>
          </div>
          
          <Progress 
            value={allocationPercentage} 
            className="h-2 bg-gray-100"
            style={{ 
              background: '#f1f5f9',
              '--progress-color': allocationPercentage >= 90 ? '#dc2626' : 
                                allocationPercentage >= 70 ? '#ea580c' : 
                                '#10b981'
            } as React.CSSProperties}
          />
        </CardContent>
      </Card>

      {/* Duration Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Duration</h3>
          <p className="text-sm text-muted-foreground mb-2">Length of training</p>
          
          {courseInstance ? (
            <>
              <p className="text-4xl font-bold mb-2">
                {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
              </p>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>08:00 - 17:00</span>
              </div>
            </>
          ) : (
            <p className="text-xl font-medium text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
