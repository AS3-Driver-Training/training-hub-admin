
import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";

interface AnalyticsDashboardHeaderProps {
  data: AnalyticsData;
}

export function AnalyticsDashboardHeader({ data }: AnalyticsDashboardHeaderProps) {
  const groupAverage = data.source_data.group_data.group_average_overall_score;
  const globalAverage = 85; // This would come from your global database
  const totalStudents = data.metadata.total_students;
  const courseDate = new Date(data.metadata.course_date).toLocaleDateString();
  
  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">{data.metadata.course_program}</h1>
        <p className="text-xl text-gray-600">{data.metadata.course_client} | {courseDate}</p>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Overall Score */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">{groupAverage}</div>
            <div className="text-sm text-blue-700 font-medium">Group Average Score</div>
            <div className="mt-2 text-xs text-blue-600">
              {groupAverage > globalAverage ? `+${(groupAverage - globalAverage).toFixed(1)}` : `${(groupAverage - globalAverage).toFixed(1)}`} vs Global ({globalAverage})
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">{totalStudents}</div>
            <div className="text-sm text-green-700 font-medium">Students Trained</div>
            <div className="mt-2 text-xs text-green-600">100% Completion Rate</div>
          </CardContent>
        </Card>

        {/* Course Duration */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-amber-600 mb-2">2</div>
            <div className="text-sm text-amber-700 font-medium">Training Days</div>
            <div className="mt-2 text-xs text-amber-600">Advanced Program</div>
          </CardContent>
        </Card>

        {/* Pass Rate */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {Math.round((data.student_performance_data.filter(s => s.overall_score >= 85).length / totalStudents) * 100)}%
            </div>
            <div className="text-sm text-purple-700 font-medium">Pass Rate (85+)</div>
            <div className="mt-2 text-xs text-purple-600">Proficiency Threshold</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
