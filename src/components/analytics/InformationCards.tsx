
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";

interface InformationCardsProps {
  data: AnalyticsData;
}

export function InformationCards({ data }: InformationCardsProps) {
  const students = data.student_performance_data.sort((a, b) => b.overall_score - a.overall_score);
  const vehicles = data.source_data.course_metadata.vehicles;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Student Roster */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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
    </div>
  );
}
