
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
  
  // Calculate correct performance metrics based on updated rules
  const studentsExceptional = data.student_performance_data.filter(s => s.overall_score >= 85).length;
  const studentsNeedTraining = data.student_performance_data.filter(s => s.overall_score < 70).length;
  const goodPerformanceStudents = data.student_performance_data.filter(s => s.overall_score >= 70 && s.overall_score < 85).length;
  const exceptionalRate = Math.round((studentsExceptional / totalStudents) * 100);
  
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
      
      {/* Performance Distribution Stats */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-center text-gray-900">Performance Distribution</h3>
        
        {/* Performance Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">{exceptionalRate}%</div>
            <div className="text-sm text-green-700 font-medium mt-1">Exceptional (85+)</div>
            <div className="text-xs text-green-600 mt-1">{studentsExceptional}/{totalStudents} students</div>
          </div>
          
          <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600">{goodPerformanceStudents}</div>
            <div className="text-sm text-yellow-700 font-medium mt-1">Good Performance</div>
            <div className="text-xs text-yellow-600 mt-1">70-84 range</div>
          </div>
          
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600">{studentsNeedTraining}</div>
            <div className="text-sm text-red-700 font-medium mt-1">Needs Training</div>
            <div className="text-xs text-red-600 mt-1">Below 70</div>
          </div>
          
          <div className="text-center p-6 bg-secondary/10 rounded-lg border border-secondary/20">
            <div className="text-3xl font-bold text-secondary">{totalStudents}</div>
            <div className="text-sm text-secondary font-medium mt-1">Total Students</div>
            <div className="text-xs text-secondary/70 mt-1">100% completion</div>
          </div>
        </div>

        {/* Performance Guidelines */}
        <div className="max-w-3xl mx-auto bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Performance Standards</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span><strong>85+:</strong> Exceptional proficiency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span><strong>70-84:</strong> Good performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span><strong>&lt;70:</strong> Additional training needed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
