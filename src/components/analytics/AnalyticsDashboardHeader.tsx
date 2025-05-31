
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
  
  // Calculate correct performance metrics based on composite scores (not percentages)
  const studentsAbove90 = data.student_performance_data.filter(s => s.overall_score >= 90).length;
  const studentsBelow70 = data.student_performance_data.filter(s => s.overall_score < 70).length;
  const proficientStudents = data.student_performance_data.filter(s => s.overall_score >= 85).length;
  const proficiencyRate = Math.round((proficientStudents / totalStudents) * 100);
  
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
      
      {/* Performance Distribution Gauge */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-center text-gray-900">Performance Distribution</h3>
        
        {/* Color Bar with Markers */}
        <div className="relative max-w-4xl mx-auto">
          {/* Color gradient bar */}
          <div className="h-16 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 relative overflow-hidden shadow-lg">
            {/* Score markers */}
            <div className="absolute inset-0 flex items-center">
              {/* Global Average Marker */}
              <div 
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${globalAverage}%` }}
              >
                <div className="w-1 h-16 bg-black shadow-md"></div>
                <div className="absolute -top-8 bg-black text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  Global Avg: {globalAverage}
                </div>
              </div>
              
              {/* Group Average Marker */}
              <div 
                className="absolute transform -translate-x-1/2 flex flex-col items-center z-10"
                style={{ left: `${groupAverage}%` }}
              >
                <div className="w-2 h-16 bg-primary shadow-lg"></div>
                <div className="absolute -top-8 bg-primary text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  Group: {groupAverage.toFixed(1)}
                </div>
              </div>
              
              {/* Best Student Marker */}
              <div 
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${bestStudent.overall_score}%` }}
              >
                <div className="w-1 h-16 bg-yellow-400 shadow-md"></div>
                <div className="absolute -bottom-8 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  Best: {bestStudent.overall_score.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Scale indicators */}
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>0</span>
            <span className="text-red-600 font-medium">&lt;70 (Need Training)</span>
            <span className="text-blue-600 font-medium">85-89 (Proficient)</span>
            <span className="text-green-600 font-medium">90+ (Excellent)</span>
            <span>100</span>
          </div>
        </div>
        
        {/* Quick Stats Below the Gauge */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
          <div className="text-center p-4 bg-tertiary/10 rounded-lg border border-tertiary/20">
            <div className="text-2xl font-bold text-tertiary">{proficiencyRate}%</div>
            <div className="text-sm text-tertiary font-medium">Proficiency Rate</div>
            <div className="text-xs text-tertiary/70">{proficientStudents}/{totalStudents} students ≥85</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{studentsAbove90}</div>
            <div className="text-sm text-green-700 font-medium">Excellent (90+)</div>
            <div className="text-xs text-green-600">High proficiency</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{studentsBelow70}</div>
            <div className="text-sm text-red-700 font-medium">Need Training (&lt;70)</div>
            <div className="text-xs text-red-600">Additional support needed</div>
          </div>
          
          <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <div className="text-2xl font-bold text-secondary">{totalStudents}</div>
            <div className="text-sm text-secondary font-medium">Total Students</div>
            <div className="text-xs text-secondary/70">100% completion</div>
          </div>
        </div>
      </div>
    </div>
  );
}
