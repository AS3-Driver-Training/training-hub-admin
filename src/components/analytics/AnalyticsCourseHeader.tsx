
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Building } from "lucide-react";
import { AnalyticsData } from "@/types/analytics";

interface AnalyticsCourseHeaderProps {
  analyticsData: AnalyticsData;
}

export function AnalyticsCourseHeader({ analyticsData }: AnalyticsCourseHeaderProps) {
  const courseDate = new Date(analyticsData.metadata.course_date).toLocaleDateString();

  return (
    <Card className="border shadow-sm mb-6">
      <CardContent className="px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {analyticsData.metadata.course_program}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{analyticsData.metadata.course_client}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{courseDate}</span>
              </div>
              {/* Add location when available in the data */}
            </div>
          </div>
          <div>
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              Course Completed
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
