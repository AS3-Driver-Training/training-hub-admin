
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";
import { Circle, Square, Diamond } from "lucide-react";

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
      color: "bg-orange-600",
      markerColor: "bg-orange-600",
      icon: Circle
    },
    {
      label: "Group Average",
      score: groupAverage,
      position: getPosition(groupAverage),
      color: "bg-blue-600",
      markerColor: "bg-blue-600",
      icon: Square
    },
    {
      label: "Top Student",
      score: topScore,
      position: getPosition(topScore),
      color: "bg-emerald-600",
      markerColor: "bg-emerald-600",
      icon: Diamond
    }
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Fixed Legend at Top */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {markers.map((marker) => {
            const IconComponent = marker.icon;
            return (
              <div key={marker.label} className={`${marker.color} rounded-lg px-4 py-3 text-white`}>
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-white" />
                  <div>
                    <div className="font-bold text-xl text-white">
                      {marker.score}
                    </div>
                    <div className="text-sm text-white/90">
                      {marker.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative pt-4 pb-8">
          {/* Enhanced Gradient Bar */}
          <div className="h-16 w-full rounded-xl bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-emerald-500 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          {/* Score markers on the bar - perfectly aligned */}
          <div className="relative -mt-8">
            {markers.map((marker) => (
              <div
                key={marker.label}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${marker.position}%` }}
              >
                {/* Large, prominent marker */}
                <div className={`w-8 h-8 rounded-full ${marker.markerColor} border-4 border-white shadow-xl relative z-10 flex items-center justify-center`}>
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                {/* Score directly below marker */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white border-2 border-gray-200 rounded-lg px-2 py-1 shadow-md">
                    <div className="font-bold text-lg text-gray-800 text-center">
                      {marker.score}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scale indicators */}
          <div className="flex justify-between mt-16 text-sm text-gray-500 font-medium">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          
          {/* Performance ranges indicator */}
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
