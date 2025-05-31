
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { AnalyticsData } from "@/types/analytics";

interface AnalyticsDashboardHeaderProps {
  data: AnalyticsData;
}

export function AnalyticsDashboardHeader({ data }: AnalyticsDashboardHeaderProps) {
  const groupAverage = data.source_data.group_data.group_average_overall_score;
  const globalAverage = 85;
  const courseDate = new Date(data.metadata.course_date).toLocaleDateString();
  
  // Find best performing student
  const bestStudent = data.student_performance_data.reduce((best, current) => 
    current.overall_score > best.overall_score ? current : best
  );
  
  return (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{data.metadata.course_program}</h1>
        <div className="flex items-center justify-center gap-4">
          <p className="text-xl text-gray-600">{data.metadata.course_client} | {courseDate}</p>
          <Link to="/performance-guide">
            <Button variant="outline" size="sm" className="text-tertiary border-tertiary hover:bg-tertiary hover:text-white">
              <Info className="h-4 w-4 mr-2" />
              How We Measure Performance
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Hero Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Group Average - Primary Metric */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-primary mb-3">{groupAverage.toFixed(1)}</div>
            <div className="text-lg font-semibold text-primary mb-2">Group Average Score</div>
            <div className="text-sm text-primary/80">
              {groupAverage > globalAverage ? 
                `+${(groupAverage - globalAverage).toFixed(1)} above global average (${globalAverage})` : 
                `${(groupAverage - globalAverage).toFixed(1)} vs global average (${globalAverage})`
              }
            </div>
          </CardContent>
        </Card>

        {/* Best Performance */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-green-600 mb-3">{bestStudent.overall_score.toFixed(1)}</div>
            <div className="text-lg font-semibold text-green-700 mb-2">Top Performance</div>
            <div className="text-sm text-green-600">{bestStudent.name}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
