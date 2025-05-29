
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
  const totalStudents = data.metadata.total_students;
  const courseDate = new Date(data.metadata.course_date).toLocaleDateString();
  
  // Calculate correct performance metrics based on the scoring guide
  const studentsAbove90 = data.student_performance_data.filter(s => s.overall_score >= 90).length;
  const studentsBelow80 = data.student_performance_data.filter(s => s.overall_score < 80).length;
  const proficientStudents = data.student_performance_data.filter(s => s.overall_score >= 80).length;
  const proficiencyRate = Math.round((proficientStudents / totalStudents) * 100);
  
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
      
      {/* Hero Metric - Group Average */}
      <div className="flex justify-center">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl font-bold text-primary mb-4">{groupAverage.toFixed(1)}</div>
            <div className="text-lg font-semibold text-primary mb-2">Group Average Score</div>
            <div className="text-sm text-primary/80">
              {groupAverage > globalAverage ? 
                `+${(groupAverage - globalAverage).toFixed(1)} above global average (${globalAverage})` : 
                `${(groupAverage - globalAverage).toFixed(1)} vs global average (${globalAverage})`
              }
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Supporting Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Proficiency Rate */}
        <Card className="bg-gradient-to-br from-tertiary/10 to-tertiary/20 border-tertiary/30">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-tertiary mb-2">{proficiencyRate}%</div>
            <div className="text-sm text-tertiary font-medium">Proficiency Rate</div>
            <div className="mt-1 text-xs text-tertiary/80">{proficientStudents}/{totalStudents} students ≥80%</div>
          </CardContent>
        </Card>

        {/* Excellence Rate */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{studentsAbove90}</div>
            <div className="text-sm text-green-700 font-medium">Excellent Performance</div>
            <div className="mt-1 text-xs text-green-600">Students scoring 90%+</div>
          </CardContent>
        </Card>

        {/* Students Needing Additional Training */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">{studentsBelow80}</div>
            <div className="text-sm text-red-700 font-medium">Need Additional Training</div>
            <div className="mt-1 text-xs text-red-600">Students scoring &lt;80%</div>
          </CardContent>
        </Card>

        {/* Total Students Trained */}
        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/20 border-secondary/30">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-secondary mb-2">{totalStudents}</div>
            <div className="text-sm text-secondary font-medium">Students Trained</div>
            <div className="mt-1 text-xs text-secondary/80">100% Completion Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
