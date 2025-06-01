
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, TrendingUp } from "lucide-react";
import { AnalyticsData } from "@/types/analytics";

interface AnalyticsEventDetailsCardsProps {
  analyticsData: AnalyticsData;
}

export function AnalyticsEventDetailsCards({ analyticsData }: AnalyticsEventDetailsCardsProps) {
  // Calculate top performer
  const topPerformer = analyticsData.student_performance_data.reduce((prev, current) => 
    (prev.overall_score > current.overall_score) ? prev : current
  );

  // Group average score (removing percentage display)
  const groupAverageScore = Math.round(analyticsData.source_data.group_data.group_average_overall_score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Performance Summary Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Group Average</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{groupAverageScore}</p>
            <p className="text-sm text-muted-foreground">Overall performance score</p>
          </div>
        </CardContent>
      </Card>

      {/* Attendees Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Attendees</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{analyticsData.metadata.total_students}</p>
            <p className="text-sm text-muted-foreground">Students completed training</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performer Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Top Performer</h3>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold">{topPerformer.name}</p>
            <p className="text-2xl font-bold text-green-600">{topPerformer.overall_score}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
