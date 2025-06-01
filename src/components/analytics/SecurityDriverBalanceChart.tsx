
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Plot from "react-plotly.js";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";

interface SecurityDriverBalanceChartProps {
  studentData: AnalyticsData['student_performance_data'];
  exerciseData: AnalyticsData['anthropic_response']['exercise_breakdown'];
}

export function SecurityDriverBalanceChart({ studentData, exerciseData }: SecurityDriverBalanceChartProps) {
  // More lenient filtering - only require final_result, provide defaults for missing data
  const validStudents = studentData.filter(student => 
    student.final_result !== undefined
  );

  // Final Exercise description
  const finalExerciseDescription = `The Final Multidisciplinary Exercise combines all previously learned skills into a comprehensive assessment. Students must demonstrate mastery of vehicle control, decision-making under pressure, and situational awareness in a complex scenario that simulates real-world driving challenges.

This exercise tests the integration of all training components and serves as the ultimate measure of a student's readiness to apply defensive driving techniques in actual situations. Performance here indicates overall program success and skill retention.

Type: Comprehensive Assessment
Difficulty Level: Hard`;

  // Calculate chart data only if we have valid students
  let chartData = [];
  let finalResultAverage = 0;
  let finalExerciseTopPerformers = [];

  if (validStudents.length > 0) {
    // Calculate average of slalom and lane change (evasion) for each student, with defaults for missing data
    chartData = validStudents.map(student => ({
      x: (student.slalom_control + student.evasion_control) / 2,
      y: student.final_result || 0,
      text: student.name,
      penalties: student.penalties || 0,
      reverseTime: student.reverse_time || 0,
    }));

    // Calculate final exercise statistics
    finalResultAverage = Math.round(validStudents.reduce((sum, s) => sum + (s.final_result || 0), 0) / validStudents.length);

    // Get top 3 performers for final exercise
    finalExerciseTopPerformers = [...validStudents]
      .sort((a, b) => (b.final_result || 0) - (a.final_result || 0))
      .slice(0, 3);
  }

  // Create the scatter plot data
  const plotData = [{
    type: 'scatter' as const,
    mode: 'markers' as const,
    x: chartData.map(d => d.x),
    y: chartData.map(d => d.y),
    text: chartData.map(d => d.text),
    marker: {
      size: chartData.map(d => Math.max(8, Math.min(30, 8 + d.reverseTime * 2))), // Size based on reverse time
      color: chartData.map(d => d.penalties),
      colorscale: 'RdYlGn_r' as const, // Red-Yellow-Green reversed colorscale
      colorbar: {
        title: {
          text: 'Penalties'
        },
        titleside: 'right',
        thickness: 15,
        len: 0.7
      },
      line: {
        color: '#FFFFFF',
        width: 2
      },
      opacity: 0.8
    },
    hovertemplate: '<b>%{text}</b><br>' +
                   'Avg Control: %{x:.1f}%<br>' +
                   'Final Result: %{y:.1f}<br>' +
                   'Penalties: %{marker.color}<br>' +
                   'Reverse Time: %{marker.size}<extra></extra>',
    name: 'Students'
  }];

  const layout = {
    title: {
      text: 'Security Driver Balance Analysis',
      font: { size: 18, color: '#1f2937', family: 'Inter, sans-serif' }
    },
    xaxis: {
      title: { 
        text: 'Average Control (Slalom + Lane Change) %', 
        font: { color: '#374151', family: 'Inter, sans-serif' } 
      },
      range: [60, 100],
      showgrid: true,
      gridcolor: '#f8fafc',
      gridwidth: 1,
      tickfont: { family: 'Inter, sans-serif' }
    },
    yaxis: {
      title: { 
        text: 'Final Result Score', 
        font: { color: '#374151', family: 'Inter, sans-serif' } 
      },
      range: [70, 110],
      showgrid: true,
      gridcolor: '#f8fafc',
      gridwidth: 1,
      tickfont: { family: 'Inter, sans-serif' }
    },
    shapes: [
      {
        type: 'rect' as const,
        x0: 70,
        x1: 90,
        y0: 80,
        y1: 100,
        fillcolor: 'rgba(59, 130, 246, 0.1)',
        line: {
          color: 'rgba(59, 130, 246, 0.4)',
          width: 2,
          dash: 'dash' as const
        },
        layer: 'below' as const
      }
    ],
    annotations: [
      {
        x: 80,
        y: 90,
        text: 'Security Driver<br>Balance Zone',
        showarrow: false,
        font: { 
          color: '#3B82F6', 
          size: 14, 
          family: 'Inter, sans-serif'
        },
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: '#3B82F6',
        borderwidth: 1
      }
    ],
    margin: { l: 80, r: 100, t: 60, b: 80 },
    height: 500,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    font: { family: 'Inter, sans-serif' }
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Security Driver Balance Analysis</CardTitle>
        <div className="text-sm text-gray-600">
          Relationship between control proficiency and final performance. The Security Driver Balance zone (highlighted) represents optimal performance characteristics.
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Final Multidisciplinary Exercise Description - Always visible */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="final" className="border border-purple-200 rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-purple-900">FINAL MULTIDISCIPLINARY EXERCISE</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="prose prose-sm prose-purple max-w-none">
                <div className="whitespace-pre-line text-gray-700">{finalExerciseDescription}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* AI Analysis for Final Exercise - Always visible if data exists */}
        {exerciseData.final_multidisciplinary_exercise && (
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <h4 className="font-semibold text-purple-900 mb-3">AI Analysis: {exerciseData.final_multidisciplinary_exercise.title}</h4>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{exerciseData.final_multidisciplinary_exercise.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Security Driver Balance Chart - Only show if we have data */}
        {validStudents.length > 0 ? (
          <>
            <Plot
              data={plotData}
              layout={layout}
              config={config}
              style={{ width: '100%', height: '500px' }}
            />

            {/* Final Exercise Performance Summary - Only show if we have data */}
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-purple-900">Final Exercise Performance Summary</h4>
                  <div className="text-sm text-purple-700">
                    Group Average: {finalResultAverage} | Students Completed: {validStudents.length}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {finalExerciseTopPerformers.map((student, index) => (
                    <div key={student.name} className="bg-white rounded p-3 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-purple-900">{student.name}</div>
                          <div className="text-sm text-purple-700">Score: {student.final_result}</div>
                        </div>
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Chart Legend and explanation - Only show if we have data */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h4 className="font-medium text-blue-900 mb-3">Chart Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-2">Axes</h5>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• X-axis: Average of Slalom and Lane Change control</li>
                    <li>• Y-axis: Final exercise result score</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-2">Visual Elements</h5>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Color: Number of penalties (green=low, red=high)</li>
                    <li>• Size: Time invested in reverse maneuvers</li>
                    <li>• Blue zone: Security Driver Balance range</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-gray-600">
              No final exercise data available for Security Driver Balance chart visualization.
              <br />
              <span className="text-sm text-gray-500">The exercise description and analysis above provide valuable information about this assessment.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
