
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
  // Filter students with final exercise data - use multiple fallback approaches
  const validStudents = studentData.filter(student => {
    // Check for final_result (new format)
    if (student.final_result !== undefined && student.final_result > 0) return true;
    
    // Check for final_ex_score (composite score)
    if (student.final_ex_score !== undefined && student.final_ex_score > 0) return true;
    
    // Check for high_stress_score (legacy fallback)
    if (student.high_stress_score !== undefined && student.high_stress_score > 0) return true;
    
    // Check for final_exercise_details (raw data)
    if (student.final_exercise_details && student.final_exercise_details.length > 0) return true;
    
    return false;
  });

  console.log('SecurityDriverBalance: validStudents count:', validStudents.length);
  console.log('SecurityDriverBalance: sample student data:', validStudents[0]);

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
    // Calculate chart data matching the matplotlib format
    chartData = validStudents.map(student => {
      // Use the correct field mappings based on available data
      const slalomControl = student.slalom_max || student.slalom_control || 0;
      const evasionControl = student.lane_change_max || student.evasion_control || 0;
      const avgControl = (slalomControl + evasionControl) / 2;
      
      // Use multiple fallbacks for final result
      const finalResult = student.final_result || 
                         student.final_ex_score || 
                         student.high_stress_score || 
                         0;
      
      // Calculate penalties from final exercise details or use direct field
      let penalties = 0;
      if (student.final_exercise_details && student.final_exercise_details.length > 0) {
        // Calculate penalties like matplotlib: 1 + (cones * c_penalty + gates * g_penalty)
        // Assuming c_penalty = g_penalty = 1 for simplicity
        const avgCones = student.final_exercise_details.reduce((sum, attempt) => sum + attempt.cones, 0) / student.final_exercise_details.length;
        const avgGates = student.final_exercise_details.reduce((sum, attempt) => sum + attempt.gates, 0) / student.final_exercise_details.length;
        penalties = 1 + (avgCones + avgGates);
      } else {
        penalties = student.penalties || 1;
      }
      
      // Calculate reverse time percentage from final exercise details or use direct field
      let reverseTimePercent = 0;
      if (student.final_exercise_details && student.final_exercise_details.length > 0) {
        reverseTimePercent = student.final_exercise_details.reduce((sum, attempt) => sum + attempt.rev_pc, 0) / student.final_exercise_details.length;
      } else {
        reverseTimePercent = student.reverse_time || 20; // Default fallback
      }

      return {
        x: avgControl,
        y: finalResult,
        text: student.name,
        penalties: penalties,
        reverseTimePercent: reverseTimePercent,
      };
    });

    // Calculate final exercise statistics
    finalResultAverage = Math.round(chartData.reduce((sum, d) => sum + d.y, 0) / chartData.length);

    // Get top 3 performers for final exercise
    finalExerciseTopPerformers = [...validStudents]
      .sort((a, b) => {
        const aScore = a.final_result || a.final_ex_score || a.high_stress_score || 0;
        const bScore = b.final_result || b.final_ex_score || b.high_stress_score || 0;
        return bScore - aScore;
      })
      .slice(0, 3);
  }

  // Create the scatter plot data
  const plotData = chartData.length > 0 ? [{
    type: 'scatter' as const,
    mode: 'markers+text' as const,
    x: chartData.map(d => d.x),
    y: chartData.map(d => d.y),
    text: chartData.map(d => d.text),
    textposition: 'top right' as const,
    textfont: {
      size: 12,
      color: '#000000'
    },
    marker: {
      size: chartData.map(d => Math.max(100, d.reverseTimePercent * 100)), // Size based on reverse time percentage
      color: chartData.map(d => d.penalties),
      colorscale: 'Turbo' as const,
      colorbar: {
        title: {
          text: 'Penalties',
          font: { color: '#374151', family: 'Inter, sans-serif' }
        },
        titleside: 'right',
        thickness: 15,
        len: 0.7
      },
      line: {
        color: '#FFFFFF',
        width: 2
      },
      opacity: 0.8,
      cmin: 1,
      cmax: Math.max(5, Math.max(...chartData.map(d => d.penalties)))
    },
    hovertemplate: '<b>%{text}</b><br>' +
                   'Control: %{x:.1f}%<br>' +
                   'Final Result: %{y:.1f}%<br>' +
                   'Penalties: %{marker.color:.1f}<br>' +
                   'Reverse Time %: %{customdata:.1f}<extra></extra>',
    customdata: chartData.map(d => d.reverseTimePercent),
    name: 'Students'
  }] : [];

  const layout = {
    title: {
      text: 'Security Driver Balance Analysis',
      font: { size: 18, color: '#1f2937', family: 'Inter, sans-serif' }
    },
    xaxis: {
      title: { 
        text: '% of control', 
        font: { color: '#374151', family: 'Inter, sans-serif' } 
      },
      range: [40, 90],
      showgrid: true,
      gridcolor: '#f8fafc',
      gridwidth: 1,
      tickfont: { family: 'Inter, sans-serif' }
    },
    yaxis: {
      title: { 
        text: '% of the exercise', 
        font: { color: '#374151', family: 'Inter, sans-serif' } 
      },
      range: [70, 100],
      showgrid: true,
      gridcolor: '#f8fafc',
      gridwidth: 1,
      tickfont: { family: 'Inter, sans-serif' }
    },
    shapes: [
      // Security Driver Balance Rectangle
      {
        type: 'rect' as const,
        x0: 70,
        x1: 90,
        y0: 80,
        y1: 98,
        fillcolor: 'rgba(245, 245, 245, 0.8)', // whitesmoke
        line: {
          color: 'darkred',
          width: 2,
          dash: 'dot' as const
        },
        layer: 'below' as const
      },
      // Skill Arrow (horizontal)
      {
        type: 'line' as const,
        x0: 35,
        x1: 85,
        y0: 72,
        y1: 72,
        line: {
          color: 'gray',
          width: 2,
          dash: 'dash' as const
        },
        layer: 'below' as const
      },
      // Control Arrow (vertical)
      {
        type: 'line' as const,
        x0: 35,
        x1: 35,
        y0: 72,
        y1: 97,
        line: {
          color: 'gray',
          width: 2,
          dash: 'dash' as const
        },
        layer: 'below' as const
      }
    ],
    annotations: [
      // Security Driver Balance label
      {
        x: 80,
        y: 89,
        text: 'Security Driver<br>Balance',
        showarrow: false,
        font: { 
          color: 'gray', 
          size: 16, 
          family: 'Inter, sans-serif'
        },
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: 'gray',
        borderwidth: 1
      },
      // Greater Control/Skill label
      {
        x: 88,
        y: 72.5,
        text: 'Greater Control/Skill',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: 'gray',
        ax: -20,
        ay: 0,
        font: { 
          color: 'gray', 
          size: 12, 
          family: 'Inter, sans-serif'
        }
      },
      // Faster Driver label
      {
        x: 35,
        y: 99,
        text: 'Faster Driver',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: 'gray',
        ax: 0,
        ay: -20,
        font: { 
          color: 'gray', 
          size: 12, 
          family: 'Inter, sans-serif'
        }
      }
    ],
    margin: { l: 80, r: 120, t: 60, b: 80 },
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
                  {finalExerciseTopPerformers.map((student, index) => {
                    const finalScore = student.final_result || student.final_ex_score || student.high_stress_score || 0;
                    return (
                      <div key={student.name} className="bg-white rounded p-3 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-purple-900">{student.name}</div>
                            <div className="text-sm text-purple-700">Score: {Math.round(finalScore)}</div>
                          </div>
                          <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    <li>• Color: Number of penalties (blue=low, red=high)</li>
                    <li>• Size: Percentage of time in reverse maneuvers</li>
                    <li>• Red dotted zone: Security Driver Balance range</li>
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
