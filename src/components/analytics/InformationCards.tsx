
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";

interface InformationCardsProps {
  data: AnalyticsData;
}

export function InformationCards({ data }: InformationCardsProps) {
  const students = data.student_performance_data.sort((a, b) => b.overall_score - a.overall_score);
  const vehicles = data.source_data.course_metadata.vehicles;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student Roster */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {students.map((student, index) => (
              <div key={student.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{student.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${
                    student.overall_score >= 90 ? 'text-green-600' :
                    student.overall_score >= 85 ? 'text-blue-600' :
                    student.overall_score >= 70 ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {student.overall_score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Used */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vehicles Used</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.car} className="p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Car #{vehicle.car}</div>
                  <div className="text-xs text-gray-500">{vehicle.year}</div>
                </div>
                <div className="text-sm text-gray-700">
                  {vehicle.make} {vehicle.model}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Lateral Acc: {vehicle.latAcc}g
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Slalom Control</span>
              <span className="font-medium">{data.source_data.group_data.group_average_slalom_vehicle_control}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Evasion Control</span>
              <span className="font-medium">{data.source_data.group_data.group_average_lnch_vehicle_control}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Final Exercise Time</span>
              <span className="font-medium">{data.source_data.group_data.Final_Excersise_Group_Avg_Time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Final Exercise Performance</span>
              <span className="font-medium">{data.source_data.group_data.Final_Excersise_Group_Avg_Performance}%</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Students ≥85 Score</span>
                <span className="font-bold text-green-600">
                  {data.student_performance_data.filter(s => s.overall_score >= 85).length}/{data.metadata.total_students}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
