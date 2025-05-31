
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Plot from "react-plotly.js";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";

interface EnhancedExerciseChartsProps {
  studentData: AnalyticsData['student_performance_data'];
  content: string;
}

export function EnhancedExerciseCharts({ studentData, content }: EnhancedExerciseChartsProps) {
  // Sort students by overall score for consistent ordering
  const sortedStudents = [...studentData].sort((a, b) => b.overall_score - a.overall_score);
  const studentNames = sortedStudents.map(s => s.name);

  // Calculate performance statistics
  const slalomGroupAverage = Math.round(sortedStudents.reduce((sum, s) => sum + s.slalom_control, 0) / sortedStudents.length);
  const evasionGroupAverage = Math.round(sortedStudents.reduce((sum, s) => sum + s.evasion_control, 0) / sortedStudents.length);
  
  // Calculate attempts averages
  const slalomAttemptsAverage = Math.round(sortedStudents.reduce((sum, s) => sum + s.slalom_attempts, 0) / sortedStudents.length);
  const evasionAttemptsAverage = Math.round(sortedStudents.reduce((sum, s) => sum + s.evasion_attempts, 0) / sortedStudents.length);

  // Get top 3 performers for Slalom
  const slalomTopPerformers = [...sortedStudents]
    .sort((a, b) => {
      if (a.slalom_control !== b.slalom_control) {
        return b.slalom_control - a.slalom_control;
      }
      return a.slalom_attempts - b.slalom_attempts;
    })
    .slice(0, 3);

  // Get top 3 performers for Evasion
  const evasionTopPerformers = [...sortedStudents]
    .sort((a, b) => {
      if (a.evasion_control !== b.evasion_control) {
        return b.evasion_control - a.evasion_control;
      }
      return a.evasion_attempts - b.evasion_attempts;
    })
    .slice(0, 3);

  // Slalom Exercise Chart Data
  const slalomData: any[] = [
    // Red dots for slalom max performance
    {
      type: 'scatter',
      mode: 'markers',
      x: studentNames,
      y: sortedStudents.map(s => s.slalom_control),
      marker: {
        size: 14,
        color: '#DC2626',
        symbol: 'circle',
        line: {
          color: '#FFFFFF',
          width: 2
        }
      },
      name: 'Max Performance %',
      hovertemplate: '<b>%{x}</b><br>Max Performance: %{y}%<extra></extra>',
      yaxis: 'y'
    },
    // Grey squares for attempts until pass
    {
      type: 'scatter',
      mode: 'markers',
      x: studentNames,
      y: sortedStudents.map(s => s.slalom_attempts),
      marker: {
        size: 12,
        color: '#6B7280',
        symbol: 'square',
        line: {
          color: '#FFFFFF',
          width: 1
        }
      },
      name: 'Attempts Until Pass',
      hovertemplate: '<b>%{x}</b><br>Attempts: %{y}<extra></extra>',
      yaxis: 'y2'
    }
  ];

  const slalomLayout = {
    title: {
      text: 'Slalom Exercise Performance',
      font: { size: 18, color: '#1f2937', family: 'Inter, sans-serif' }
    },
    xaxis: {
      title: { text: 'Students', font: { color: '#374151', family: 'Inter, sans-serif' } },
      showgrid: false,
      tickangle: -45,
      tickfont: { family: 'Inter, sans-serif', size: 11 }
    },
    yaxis: {
      title: { text: 'Performance %', font: { color: '#DC2626', family: 'Inter, sans-serif' } },
      side: 'left' as const,
      range: [0, 100],
      showgrid: true,
      gridcolor: '#f8fafc',
      gridwidth: 1,
      tickfont: { family: 'Inter, sans-serif' }
    },
    yaxis2: {
      title: { text: 'Number of Attempts', font: { color: '#6B7280', family: 'Inter, sans-serif' } },
      side: 'right' as const,
      overlaying: 'y' as const,
      range: [0, Math.max(...sortedStudents.map(s => s.slalom_attempts)) + 2],
      showgrid: false,
      tickfont: { family: 'Inter, sans-serif' }
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      yref: 'y' as const,
      line: { color: '#F59E0B', width: 2, dash: 'dash' as const },
      layer: 'below' as const
    }],
    annotations: [
      {
        x: 0.02,
        y: 82,
        xref: 'paper' as const,
        yref: 'y' as const,
        text: '80% Performance Threshold',
        showarrow: false,
        font: { color: '#F59E0B', size: 12, family: 'Inter, sans-serif' }
      },
      {
        x: 0.98,
        y: slalomGroupAverage + 2,
        xref: 'paper' as const,
        yref: 'y' as const,
        text: `Group Avg: ${slalomGroupAverage}%`,
        showarrow: false,
        font: { color: '#6B7280', size: 11, family: 'Inter, sans-serif' },
        xanchor: 'right' as const
      },
      {
        x: 0.98,
        y: slalomAttemptsAverage + 0.5,
        xref: 'paper' as const,
        yref: 'y2' as const,
        text: `Avg Attempts: ${slalomAttemptsAverage}`,
        showarrow: false,
        font: { color: '#9CA3AF', size: 11, family: 'Inter, sans-serif' },
        xanchor: 'right' as const
      }
    ],
    margin: { l: 80, r: 100, t: 60, b: 120 },
    height: 450,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: false,
    font: { family: 'Inter, sans-serif' }
  };

  // Barricade Evasion Chart Data
  const evasionData: any[] = [
    // Red dots for evasion max performance
    {
      type: 'scatter',
      mode: 'markers',
      x: studentNames,
      y: sortedStudents.map(s => s.evasion_control),
      marker: {
        size: 14,
        color: '#DC2626',
        symbol: 'circle',
        line: {
          color: '#FFFFFF',
          width: 2
        }
      },
      name: 'Max Performance %',
      hovertemplate: '<b>%{x}</b><br>Max Performance: %{y}%<extra></extra>',
      yaxis: 'y'
    },
    // Grey squares for attempts until pass
    {
      type: 'scatter',
      mode: 'markers',
      x: studentNames,
      y: sortedStudents.map(s => s.evasion_attempts),
      marker: {
        size: 12,
        color: '#6B7280',
        symbol: 'square',
        line: {
          color: '#FFFFFF',
          width: 1
        }
      },
      name: 'Attempts Until Pass',
      hovertemplate: '<b>%{x}</b><br>Attempts: %{y}<extra></extra>',
      yaxis: 'y2'
    }
  ];

  const evasionLayout = {
    title: {
      text: 'Barricade Evasion Exercise Performance',
      font: { size: 18, color: '#1f2937', family: 'Inter, sans-serif' }
    },
    xaxis: {
      title: { text: 'Students', font: { color: '#374151', family: 'Inter, sans-serif' } },
      showgrid: false,
      tickangle: -45,
      tickfont: { family: 'Inter, sans-serif', size: 11 }
    },
    yaxis: {
      title: { text: 'Performance %', font: { color: '#DC2626', family: 'Inter, sans-serif' } },
      side: 'left' as const,
      range: [0, 100],
      showgrid: true,
      gridcolor: '#f8fafc',
      gridwidth: 1,
      tickfont: { family: 'Inter, sans-serif' }
    },
    yaxis2: {
      title: { text: 'Number of Attempts', font: { color: '#6B7280', family: 'Inter, sans-serif' } },
      side: 'right' as const,
      overlaying: 'y' as const,
      range: [0, Math.max(...sortedStudents.map(s => s.evasion_attempts)) + 2],
      showgrid: false,
      tickfont: { family: 'Inter, sans-serif' }
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      yref: 'y' as const,
      line: { color: '#F59E0B', width: 2, dash: 'dash' as const },
      layer: 'below' as const
    }],
    annotations: [
      {
        x: 0.02,
        y: 82,
        xref: 'paper' as const,
        yref: 'y' as const,
        text: '80% Performance Threshold',
        showarrow: false,
        font: { color: '#F59E0B', size: 12, family: 'Inter, sans-serif' }
      },
      {
        x: 0.98,
        y: evasionGroupAverage + 2,
        xref: 'paper' as const,
        yref: 'y' as const,
        text: `Group Avg: ${evasionGroupAverage}%`,
        showarrow: false,
        font: { color: '#6B7280', size: 11, family: 'Inter, sans-serif' },
        xanchor: 'right' as const
      },
      {
        x: 0.98,
        y: evasionAttemptsAverage + 0.5,
        xref: 'paper' as const,
        yref: 'y2' as const,
        text: `Avg Attempts: ${evasionAttemptsAverage}`,
        showarrow: false,
        font: { color: '#9CA3AF', size: 11, family: 'Inter, sans-serif' },
        xanchor: 'right' as const
      }
    ],
    margin: { l: 80, r: 100, t: 60, b: 120 },
    height: 450,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: false,
    font: { family: 'Inter, sans-serif' }
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Exercise Performance Analysis</CardTitle>
        <div className="text-sm text-gray-600">
          Individual student performance across core training exercises. Red dots show maximum performance achieved, grey squares show attempts until passing.
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Slalom Exercise Section */}
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="slalom" className="border border-blue-200 rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-blue-900">SLALOM EXERCISE</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="text-blue-800 space-y-3 text-sm leading-relaxed">
                  <p>
                    The Slalom exercise may seem basic, but it is the most demanding of all activities. This test creates a 
                    consistent skill that involves a deep understanding of time/distance and hand/eye coordination. Its 
                    consistency allows us to measure it precisely to determine driver skill and focus areas; this is the basis 
                    for everything we train in evasive driving.
                  </p>
                  <p>
                    The Slalom exercise requires that the student maintains a consistent speed above 80% of the car's 
                    lateral acceleration capability while negotiating through the turns. The students must perform the 
                    exercise without hitting cones and maintaining a constant speed (a 4 mile an hour variation will 
                    invalidate the test); this involves learning where to look and anticipate turns while controlling the 
                    throttle to counter the drag to sustain speed.
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p><strong>Type:</strong> Regular Slalom – 4 Cones (50ft Chord)</p>
                    <p><strong>Difficulty Level:</strong> Medium / Hard</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Plot
            data={slalomData}
            layout={slalomLayout}
            config={config}
            style={{ width: '100%', height: '450px' }}
          />
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-800 text-sm">
              <span className="font-semibold">Group Average Vehicle Control: {slalomGroupAverage}%</span> | 
              <span className="font-semibold ml-2">Top Performer: {slalomTopPerformers[0]?.name} ({slalomTopPerformers[0]?.slalom_control}%)</span>
            </div>
          </div>
        </div>

        {/* Barricade Evasion Section */}
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="evasion" className="border border-green-200 rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-green-900">BARRICADE EVASION (Lane Change)</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="text-green-800 space-y-3 text-sm leading-relaxed">
                  <p>
                    Based on the research published by the Society of Automotive Engineers, in this exercise, students 
                    are pushed to the limits of cognitive reaction times through an electronically operated signal system 
                    that allows them little room for error. The Barricade requires situational awareness and 
                    decision-making while using all the skills acquired in the Slalom, adding a psychological factor as the 
                    speed through the exercise is slightly increased.
                  </p>
                  <p>
                    Just as the Slalom, this exercise requires skill as it is graded at 80% of the car's lateral acceleration 
                    capability and requires the same speed consistency as stated above.
                  </p>
                  <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                    <p><strong>Type:</strong> Regular LnCh – .75 Sec Reaction time (100ft Chord)</p>
                    <p><strong>Difficulty Level:</strong> Medium</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Plot
            data={evasionData}
            layout={evasionLayout}
            config={config}
            style={{ width: '100%', height: '450px' }}
          />
          
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-800 text-sm">
              <span className="font-semibold">Group Average Vehicle Control: {evasionGroupAverage}%</span> | 
              <span className="font-semibold ml-2">Top Performer: {evasionTopPerformers[0]?.name} ({evasionTopPerformers[0]?.slalom_control}%)</span>
            </div>
          </div>
        </div>
        
        {/* Consolidated Chart Legend */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Chart Legend & Performance Standards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Chart Elements</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>Red dots = Maximum performance achieved</li>
                <li>• <span className="inline-block w-3 h-3 bg-gray-500 mr-2"></span>Grey squares = Attempts until pass</li>
                <li>• <span className="inline-block w-3 h-0.5 bg-orange-400 mr-2"></span>Orange line = 80% performance threshold</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Performance Standards</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 80%+ Performance: Proficient in exercise</li>
                <li>• Fewer attempts: Faster skill acquisition</li>
                <li>• Consistent speed: Critical for safety</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none border-t pt-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
