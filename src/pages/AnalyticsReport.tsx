
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsData } from "@/services/analyticsService";
import { ExecutiveSummary } from "@/components/analytics/ExecutiveSummary";
import { PerformanceDistributionChart } from "@/components/analytics/PerformanceDistributionChart";
import { StressPerformanceChart } from "@/components/analytics/StressPerformanceChart";
import { ExercisePerformanceCharts } from "@/components/analytics/ExercisePerformanceCharts";
import { RiskAssessment } from "@/components/analytics/RiskAssessment";

export default function AnalyticsReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => getAnalyticsData(id!),
    enabled: !!id,
  });

  const handleBack = () => {
    navigate(`/events/${id}/close`);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
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
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Analytics Report</h1>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-destructive">
              Error loading analytics data. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{analyticsData.metadata.course_program}</h1>
            <p className="text-muted-foreground">
              Analytics Report - {analyticsData.metadata.course_date}
            </p>
          </div>
        </div>
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

      <div className="print:block hidden">
        <h1 className="text-2xl font-bold mb-2">{analyticsData.metadata.course_program}</h1>
        <p className="text-muted-foreground mb-4">
          Analytics Report - {analyticsData.metadata.course_date} | {analyticsData.metadata.course_client}
        </p>
      </div>

      <ExecutiveSummary data={analyticsData.anthropic_responses.executive_summary} />
      
      <PerformanceDistributionChart 
        studentData={analyticsData.student_performance_data}
        content={analyticsData.anthropic_responses.performance_distribution.content}
      />
      
      <StressPerformanceChart 
        studentData={analyticsData.student_performance_data}
        content={analyticsData.anthropic_responses.stress_performance_analysis.content}
      />
      
      <ExercisePerformanceCharts 
        studentData={analyticsData.student_performance_data}
        content={analyticsData.anthropic_responses.exercise_breakdown.content}
      />
      
      <RiskAssessment 
        content={analyticsData.anthropic_responses.risk_assessment_recommendations.content}
      />
    </div>
  );
}
