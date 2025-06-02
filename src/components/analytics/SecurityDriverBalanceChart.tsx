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
  let xRange = [30, 90];
  let yRange = [70, 100];

  if (validStudents.length > 0) {
    // Calculate chart data matching your React reference format
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

    // Calculate dynamic axis ranges based on actual data
    const xValues = chartData.map(d => d.x);
    const yValues = chartData.map(d => d.y);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    // Add padding (10% buffer) and ensure minimum range
    const xPadding = Math.max((xMax - xMin) * 0.1, 5);
    const yPadding = Math.max((yMax - yMin) * 0.1, 5);
    
    xRange = [
      Math.max(0, xMin - xPadding),
      Math.min(100, xMax + xPadding)
    ];
    
    yRange = [
      Math.max(0, yMin - yPadding),
      Math.min(100, yMax + yPadding)
    ];
    
    // Ensure minimum range for readability
    if (xRange[1] - xRange[0] < 15) {
      const center = (xRange[0] + xRange[1]) / 2;
      xRange = [Math.max(0, center - 7.5), Math.min(100, center + 7.5)];
    }
    
    if (yRange[1] - yRange[0] < 15) {
      const center = (yRange[0] + yRange[1]) / 2;
      yRange = [Math.max(0, center - 7.5), Math.min(100, center + 7.5)];
    }

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

  // Calculate positions for arrows based on dynamic ranges
  const xArrowStart = xRange[0] + (xRange[1] - xRange[0]) * 0.15;
  const yArrowStart = yRange[0] + (yRange[1] - yRange[0]) * 0.15;
  const xArrowEnd = xRange[1] - (xRange[1] - xRange[0]) * 0.05;
  const yArrowEnd = yRange[1] - (yRange[1] - yRange[0]) * 0.05;

  // Create the plot data following your React reference exactly
  let plotData = [];
  
  if (chartData.length > 0) {
    // Main scatter plot trace with improved bubble sizing
    const scatterTrace = {
      x: chartData.map(d => d.x),
      y: chartData.map(d => d.y),
      mode: 'markers+text' as const,
      type: 'scatter' as const,
      marker: {
        size: chartData.map(d => {
          // Better bubble scaling: base size + scaled component with constraints
          const baseSize = 8;
          const scaledSize = Math.sqrt(d.reverseTimePercent) * 2;
          return Math.min(Math.max(baseSize + scaledSize, 8), 25);
        }),
        color: chartData.map(d => d.penalties),
        colorscale: [
          [0, '#0d0887'],
          [0.1111111111111111, '#46039f'],
          [0.2222222222222222, '#7201a8'],
          [0.3333333333333333, '#9c179e'],
          [0.4444444444444444, '#bd3786'],
          [0.5555555555555556, '#d8576b'],
          [0.6666666666666666, '#ed7953'],
          [0.7777777777777778, '#fb9f3a'],
          [0.8888888888888888, '#fdca26'],
          [1.0, '#f0f921']
        ] as [number, string][],
        showscale: true,
        colorbar: {
          title: {
            text: 'Penalties',
            side: 'right' as const
          },
          titleside: 'right' as const,
          x: 1.02
        },
        line: {
          width: 1,
          color: 'rgba(0,0,0,0.3)'
        }
      },
      text: chartData.map(d => d.text),
      textposition: 'top right' as const,
      textfont: {
        size: 12,
        color: 'black'
      },
      hovertemplate: 
        '<b>%{text}</b><br>' +
        '% Control: %{x}<br>' +
        '% Exercise: %{y}<br>' +
        '<extra></extra>',
      showlegend: false
    };

    // Vertical arrow trace (dynamic positioning)
    const verticalArrowTrace = {
      x: [xArrowStart, xArrowStart],
      y: [yArrowStart, yArrowEnd],
      mode: 'lines' as const,
      type: 'scatter' as const,
      line: {
        color: 'gray',
        width: 2,
        dash: 'dash' as const
      },
      showlegend: false,
      hoverinfo: 'skip' as const
    };

    // Horizontal arrow trace (dynamic positioning)
    const horizontalArrowTrace = {
      x: [xArrowStart, xArrowEnd],
      y: [yArrowStart, yArrowStart],
      mode: 'lines' as const,
      type: 'scatter' as const,
      line: {
        color: 'gray',
        width: 2,
        dash: 'dash' as const
      },
      showlegend: false,
      hoverinfo: 'skip' as const
    };

    plotData = [scatterTrace, verticalArrowTrace, horizontalArrowTrace];
  }

  const layout = {
    title: {
      text: ''
    },
    xaxis: {
      title: {
        text: '% of control',
        font: { size: 14 }
      },
      range: xRange,
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      zeroline: false
    },
    yaxis: {
      title: {
        text: '% of the exercise',
        font: { size: 14 }
      },
      range: yRange,
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      zeroline: false
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    width: 800,
    height: 400,
    margin: {
      l: 80,
      r: 120,
      t: 50,
      b: 80
    },
    annotations: [
      // Vertical arrow head and label (dynamic positioning)
      {
        x: xArrowStart,
        y: yArrowEnd,
        text: '▲',
        showarrow: false,
        font: { size: 16, color: 'gray' },
        xanchor: 'center' as const,
        yanchor: 'bottom' as const
      },
      {
        x: xArrowStart,
        y: yArrowEnd + (yRange[1] - yRange[0]) * 0.03,
        text: 'Faster Driver',
        showarrow: false,
        font: { size: 14, color: 'gray' },
        xanchor: 'center' as const,
        yanchor: 'top' as const
      },
      // Horizontal arrow head and label (fixed positioning to prevent overlap)
      {
        x: xArrowEnd,
        y: yArrowStart,
        text: '▶',
        showarrow: false,
        font: { size: 16, color: 'gray' },
        xanchor: 'left' as const,
        yanchor: 'middle' as const
      },
      {
        x: xArrowEnd + 3,
        y: yArrowStart + 8,
        text: 'Greater Control/Skill',
        showarrow: false,
        font: { size: 14, color: 'gray' },
        xanchor: 'left' as const,
        yanchor: 'bottom' as const
      },
      // Security Driver Balance rectangle label (fixed positioning)
      {
        x: 80,
        y: 94,
        text: 'Security Driver<br>Balance',
        showarrow: false,
        font: { size: 18, color: 'gray' },
        xanchor: 'center' as const,
        yanchor: 'bottom' as const
      }
    ],
    shapes: [
      // Security Driver Balance rectangle (FIXED coordinates)
      {
        type: 'rect' as const,
        x0: 70,
        y0: 80,
        x1: 90,
        y1: 98,
        line: {
          color: 'darkred',
          width: 2,
          dash: 'dot' as const
        },
        fillcolor: 'rgba(245, 245, 245, 0.8)',
        layer: 'below' as const
      }
    ]
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d' as const, 'lasso2d' as const, 'select2d' as const],
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
              style={{ width: '100%', height: '400px' }}
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
                    <li>• Color: Number of penalties (purple=low, yellow=high)</li>
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
