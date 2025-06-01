
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Trophy } from "lucide-react";
import { AnalyticsData } from "@/types/analytics";

interface AnalyticsEventDetailsCardsProps {
  analyticsData: AnalyticsData;
  courseId: string;
}

export function AnalyticsEventDetailsCards({ analyticsData, courseId }: AnalyticsEventDetailsCardsProps) {
  // Calculate top performer
  const topPerformer = analyticsData.student_performance_data.reduce((prev, current) => 
    (prev.overall_score > current.overall_score) ? prev : current
  );

  // Group average score
  const groupAverageScore = Math.round(analyticsData.source_data.group_data.group_average_overall_score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
      {/* Performance Summary Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Performance Summary</h3>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold">{groupAverageScore}%</p>
              <p className="text-sm text-muted-foreground">Group Average Score</p>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Course Completed
            </Badge>
            <p className="text-sm text-muted-foreground">
              Client: <span className="font-medium">{analyticsData.metadata.course_client}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attendees Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Attendees</h3>
          <div className="space-y-2">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">{analyticsData.metadata.total_students}</span>
              <span className="text-lg text-muted-foreground ml-1">students</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">Successfully completed training</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performer Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Top Performer</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{topPerformer.name}</p>
                <p className="text-2xl font-bold text-green-600">{topPerformer.overall_score}%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground">Overall performance score</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
