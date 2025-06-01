
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";

interface PerformanceComparisonBarProps {
  analyticsData: AnalyticsData;
}

export function PerformanceComparisonBar({ analyticsData }: PerformanceComparisonBarProps) {
  // Calculate scores
  const groupAverage = Math.round(analyticsData.source_data.group_data.group_average_overall_score);
  const topStudent = analyticsData.student_performance_data.reduce((prev, current) => 
    (prev.overall_score > current.overall_score) ? prev : current
  );
  const topScore = Math.round(topStudent.overall_score);
  
  // Using industry standard of 75 as global average for driving training
  const globalAverage = 75;
  
  // Calculate positions on the bar (0-100 scale)
  const getPosition = (score: number) => Math.min(Math.max(score, 0), 100);
  
  const markers = [
    {
      label: "Global Average",
      score: globalAverage,
      position: getPosition(globalAverage),
      color: "bg-orange-500",
      textColor: "text-orange-700",
      labelOffset: "-top-12" // Above the bar
    },
    {
      label: "Group Average",
      score: groupAverage,
      position: getPosition(groupAverage),
      color: "bg-blue-500",
      textColor: "text-blue-700",
      labelOffset: "top-6" // Below the bar, first level
    },
    {
      label: "Top Student",
      score: topScore,
      position: getPosition(topScore),
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      labelOffset: "top-16" // Below the bar, second level
    }
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pt-16 pb-4">
          {/* Gradient Bar */}
          <div className="h-8 w-full rounded-lg bg-gradient-to-r from-red-400 via-yellow-400 via-blue-400 to-emerald-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/80 via-yellow-500/80 via-blue-500/80 to-emerald-500/80"></div>
          </div>
          
          {/* Score markers */}
          <div className="relative -mt-2">
            {markers.map((marker, index) => (
              <div
                key={marker.label}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${marker.position}%` }}
              >
                {/* Marker dot */}
                <div className={`w-4 h-4 rounded-full ${marker.color} border-2 border-white shadow-lg`}></div>
                
                {/* Score label */}
                <div className={`absolute ${marker.labelOffset} transform -translate-x-1/2 text-center min-w-max`}>
                  <div className={`text-sm font-semibold ${marker.textColor}`}>
                    {marker.score}
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    {marker.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scale indicators */}
          <div className="flex justify-between mt-20 text-xs text-gray-500">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
