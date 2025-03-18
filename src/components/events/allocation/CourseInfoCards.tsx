
import { MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseInfoCardsProps {
  courseInstance: any;
}

export function CourseInfoCards({ courseInstance }: CourseInfoCardsProps) {
  if (!courseInstance) return null;
  
  const startDate = courseInstance?.start_date ? 
    format(new Date(courseInstance.start_date), "MMMM d, yyyy") : 
    "Loading...";
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Program Details Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <div className="flex items-center mb-5">
            <div className="w-4 h-4 rounded-full bg-rose-600 mr-2.5"></div>
            <h3 className="text-xl font-semibold">Program Details</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
              <p className="font-medium">{startDate}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
              <p className="font-medium">
                {courseInstance?.venue?.region || 'California'}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Course Description</h4>
            <p className="text-muted-foreground">
              {courseInstance?.program?.description || 
                "Advanced Evasive Skill and Heuristic Development Course for students that have gone through the Lvl 1 course within the past 2 years."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location Details Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <h3 className="text-xl font-semibold mb-4">Location Details</h3>
          
          <p className="font-medium mb-2">
            {courseInstance?.venue?.name || "Weather Tech Laguna Seca International Raceway"}
          </p>
          
          <p className="text-muted-foreground mb-1">
            {courseInstance?.venue?.address || "1021 Monterey Salinas Hwy"}
          </p>
          <p className="text-muted-foreground mb-6">
            {courseInstance?.venue?.region || "California"}
          </p>
          
          <div className="p-4 bg-slate-50 rounded-md border mb-4">
            <h4 className="text-sm font-medium mb-1">Meeting Point:</h4>
            <p className="text-sm text-muted-foreground">
              Main paddock next to the gas pumps 15 prior to starting hour.
            </p>
          </div>
          
          <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            View on Google Maps
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
