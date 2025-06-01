
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAnalyticsData } from "@/services/analyticsService";
import { ExecutiveSummary } from "@/components/analytics/ExecutiveSummary";
import { ModernPerformanceDistribution } from "@/components/analytics/ModernPerformanceDistribution";
import { InformationCards } from "@/components/analytics/InformationCards";
import { StressPerformanceChart } from "@/components/analytics/StressPerformanceChart";
import { ExerciseAnalysisCharts } from "@/components/analytics/ExerciseAnalysisCharts";
import { RiskAssessment } from "@/components/analytics/RiskAssessment";
import { AnalyticsEventDetailsCards } from "@/components/analytics/AnalyticsEventDetailsCards";
import { AnalyticsAdminActions } from "@/components/analytics/AnalyticsAdminActions";
import { AnalyticsCourseHeader } from "@/components/analytics/AnalyticsCourseHeader";
import { PerformanceComparisonBar } from "@/components/analytics/PerformanceComparisonBar";

export default function AnalyticsReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => getAnalyticsData(id!),
    enabled: !!id,
  });

  const handleBack = () => {
    navigate('/events');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Events
            </Button>
            <h1 className="text-3xl font-bold">Analytics Report</h1>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Loading analytics data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Button>
          <h1 className="text-3xl font-bold">Analytics Report</h1>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-destructive">
              No analytics data available for this course. Please ensure the course has been processed for analytics.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 print:space-y-4">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="print:block hidden">
        <h1 className="text-2xl font-bold mb-2">{analyticsData.metadata.course_program}</h1>
        <p className="text-muted-foreground mb-4">
          Analytics Report - {analyticsData.metadata.course_date} | {analyticsData.metadata.course_client}
        </p>
      </div>

      {/* Admin Actions (only visible to internal admins/superadmins) */}
      <AnalyticsAdminActions 
        courseId={id!}
        courseName={analyticsData.metadata.course_program}
      />

      {/* Course Details Header */}
      <AnalyticsCourseHeader analyticsData={analyticsData} />

      {/* Performance Summary Cards */}
      <AnalyticsEventDetailsCards analyticsData={analyticsData} />

      {/* Performance Comparison Bar */}
      <PerformanceComparisonBar analyticsData={analyticsData} />

      {/* Executive Summary */}
      <ExecutiveSummary data={analyticsData.anthropic_response.executive_summary} />
      
      {/* Information Cards */}
      <InformationCards data={analyticsData} />
      
      {/* Performance Distribution */}
      <ModernPerformanceDistribution 
        studentData={analyticsData.student_performance_data}
        content={analyticsData.anthropic_response.performance_distribution.content}
        totalStudents={analyticsData.metadata.total_students}
      />
      
      {/* Exercise Performance Charts */}
      <ExerciseAnalysisCharts 
        studentData={analyticsData.student_performance_data}
        exerciseData={analyticsData.anthropic_response.exercise_breakdown}
      />
      
      {/* Stress Performance Analysis */}
      <StressPerformanceChart 
        studentData={analyticsData.student_performance_data}
        content={analyticsData.anthropic_response.stress_performance_analysis.content}
      />
      
      {/* Risk Assessment */}
      <RiskAssessment 
        content={analyticsData.anthropic_response.risk_assessment_recommendations.content}
      />
    </div>
  );
}
