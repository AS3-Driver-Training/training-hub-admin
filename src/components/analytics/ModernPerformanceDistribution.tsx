
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePerformanceTiers } from "@/services/analyticsService";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";

interface ModernPerformanceDistributionProps {
  studentData: AnalyticsData['student_performance_data'];
  content: string;
}

export function ModernPerformanceDistribution({ studentData, content }: ModernPerformanceDistributionProps) {
  const tiers = calculatePerformanceTiers(studentData);
  const total = studentData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Modern Progress Bar */}
          <div className="space-y-4">
            <div className="flex h-8 w-full rounded-lg overflow-hidden border border-gray-200">
              {tiers.map((tier, index) => (
                tier.count > 0 && (
                  <div
                    key={tier.name}
                    className="flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      backgroundColor: tier.color,
                      width: `${(tier.count / total) * 100}%`,
                    }}
                  >
                    {tier.count}
                  </div>
                )
              ))}
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {tiers.map((tier) => (
                <div key={tier.name} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: tier.color }}
                  />
                  <div className="text-sm">
                    <div className="font-medium">{tier.name.split(' ')[0]}</div>
                    <div className="text-gray-500">{tier.count} ({tier.percentage}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none border-t pt-4">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
