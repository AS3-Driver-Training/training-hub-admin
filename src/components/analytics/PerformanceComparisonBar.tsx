
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
      color: "bg-orange-500",
      textColor: "text-orange-700",
      borderColor: "border-orange-500",
      bgColor: "bg-orange-50",
      icon: Circle
    },
    {
      label: "Group Average",
      score: groupAverage,
      position: getPosition(groupAverage),
      color: "bg-blue-500",
      textColor: "text-blue-700",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-50",
      icon: Square
    },
    {
      label: "Top Student",
      score: topScore,
      position: getPosition(topScore),
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-500",
      bgColor: "bg-emerald-50",
      icon: Diamond
    }
  ];

  // Smart label positioning to prevent overlaps
  const getSmartLabelPosition = (index: number, position: number) => {
    const minSpacing = 12; // Minimum 12% spacing between labels
    let adjustedPosition = position;
    
    // Check for overlaps with previous markers
    for (let i = 0; i < index; i++) {
      const prevPosition = markers[i].position;
      if (Math.abs(adjustedPosition - prevPosition) < minSpacing) {
        // Adjust position to prevent overlap
        if (adjustedPosition > prevPosition) {
          adjustedPosition = prevPosition + minSpacing;
        } else {
          adjustedPosition = prevPosition - minSpacing;
        }
      }
    }
    
    // Ensure we don't go out of bounds
    return Math.min(Math.max(adjustedPosition, 8), 92);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pt-24 pb-8">
          {/* Labels Row - Above the bar */}
          <div className="absolute -top-2 w-full h-20">
            {markers.map((marker, index) => {
              const labelPosition = getSmartLabelPosition(index, marker.position);
              const IconComponent = marker.icon;
              
              return (
                <div
                  key={marker.label}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${labelPosition}%` }}
                >
                  {/* Label Card */}
                  <div className={`${marker.bgColor} ${marker.borderColor} border-2 rounded-lg px-3 py-2 shadow-sm mb-2`}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <IconComponent className={`w-4 h-4 ${marker.textColor}`} />
                      <div>
                        <div className={`font-bold text-lg ${marker.textColor}`}>
                          {marker.score}
                        </div>
                        <div className="text-xs text-gray-600">
                          {marker.label}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connecting Line */}
                  <div className="flex justify-center">
                    <div className={`w-0.5 h-6 ${marker.color}`}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Gradient Bar */}
          <div className="h-12 w-full rounded-xl bg-gradient-to-r from-red-400 via-yellow-400 via-blue-400 to-emerald-400 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/60 via-yellow-500/60 via-blue-500/60 to-emerald-500/60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>
          
          {/* Score markers on the bar */}
          <div className="relative -mt-6">
            {markers.map((marker) => (
              <div
                key={marker.label}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${marker.position}%` }}
              >
                {/* Marker dot */}
                <div className={`w-6 h-6 rounded-full ${marker.color} border-3 border-white shadow-lg relative z-10`}>
                  <div className="absolute inset-0 rounded-full bg-white/30"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scale indicators */}
          <div className="flex justify-between mt-8 text-sm text-gray-500 font-medium">
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
