
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Get top 3 performers for Slalom (by performance %, then by fewer attempts)
  const slalomTopPerformers = [...sortedStudents]
    .sort((a, b) => {
      if (a.slalom_control !== b.slalom_control) {
        return b.slalom_control - a.slalom_control;
      }
      return a.slalom_attempts - b.slalom_attempts;
    })
    .slice(0, 3);

  // Get top 3 performers for Evasion (by performance %, then by fewer attempts)
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
    // Performance average line (behind data points)
    {
      type: 'scatter',
      mode: 'lines',
      x: studentNames,
      y: Array(studentNames.length).fill(slalomGroupAverage),
      line: {
        color: '#6B7280',
        width: 2,
        dash: 'dot'
      },
      name: `Control Average (${slalomGroupAverage}%)`,
      showlegend: false,
      hoverinfo: 'skip',
      yaxis: 'y'
    },
    // Attempts average line (behind data points)
    {
      type: 'scatter',
      mode: 'lines',
      x: studentNames,
      y: Array(studentNames.length).fill(slalomAttemptsAverage),
      line: {
        color: '#9CA3AF',
        width: 2,
        dash: 'dot'
      },
      name: `Attempts Average (${slalomAttemptsAverage})`,
      showlegend: false,
      hoverinfo: 'skip',
      yaxis: 'y2'
    },
    // Red dots for slalom max performance (on top)
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
    // Grey squares for attempts until pass (on top)
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
      gridcolor: '#f1f5f9',
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
      line: { color: '#FF9F1C', width: 3, dash: 'dash' as const },
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
        font: { color: '#FF9F1C', size: 12, family: 'Inter, sans-serif' }
      },
      {
        x: 0.98,
        y: slalomGroupAverage + 2,
        xref: 'paper' as const,
        yref: 'y' as const,
        text: `${slalomGroupAverage}% Group Average`,
        showarrow: false,
        font: { color: '#6B7280', size: 11, family: 'Inter, sans-serif' },
        xanchor: 'right' as const
      }
    ],
    margin: { l: 80, r: 80, t: 60, b: 120 },
    height: 500,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: false,
    font: { family: 'Inter, sans-serif' }
  };

  // Barricade Evasion Chart Data
  const evasionData: any[] = [
    // Performance average line (behind data points)
    {
      type: 'scatter',
      mode: 'lines',
      x: studentNames,
      y: Array(studentNames.length).fill(evasionGroupAverage),
      line: {
        color: '#6B7280',
        width: 2,
        dash: 'dot'
      },
      name: `Control Average (${evasionGroupAverage}%)`,
      showlegend: false,
      hoverinfo: 'skip',
      yaxis: 'y'
    },
    // Attempts average line (behind data points)
    {
      type: 'scatter',
      mode: 'lines',
      x: studentNames,
      y: Array(studentNames.length).fill(evasionAttemptsAverage),
      line: {
        color: '#9CA3AF',
        width: 2,
        dash: 'dot'
      },
      name: `Attempts Average (${evasionAttemptsAverage})`,
      showlegend: false,
      hoverinfo: 'skip',
      yaxis: 'y2'
    },
    // Red dots for evasion max performance (on top)
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
    // Grey squares for attempts until pass (on top)
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
      gridcolor: '#f1f5f9',
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
      line: { color: '#FF9F1C', width: 3, dash: 'dash' as const },
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
        font: { color: '#FF9F1C', size: 12, family: 'Inter, sans-serif' }
      },
      {
        x: 0.98,
        y: evasionGroupAverage + 2,
        xref: 'paper' as const,
        yref: 'y' as const,
        text: `${evasionGroupAverage}% Group Average`,
        showarrow: false,
        font: { color: '#6B7280', size: 11, family: 'Inter, sans-serif' },
        xanchor: 'right' as const
      }
    ],
    margin: { l: 80, r: 80, t: 60, b: 120 },
    height: 500,
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
      <CardContent>
        {/* Exercise Descriptions */}
        <div className="mb-8 space-y-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-3">SLALOM</h3>
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
              <div className="mt-4 bg-blue-100 p-3 rounded border-l-4 border-blue-400">
                <p><strong>Type:</strong> Regular Slalom – 4 Cones (50ft Chord)</p>
                <p><strong>Difficulty Level:</strong> Medium / Hard</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-bold text-green-900 mb-3">BARRICADE EVASION (Lane Change)</h3>
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
              <div className="mt-4 bg-green-100 p-3 rounded border-l-4 border-green-400">
                <p><strong>Type:</strong> Regular LnCh – .75 Sec Reaction time (100ft Chord)</p>
                <p><strong>Difficulty Level:</strong> Medium</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slalom Exercise Chart */}
        <div className="mb-8">
          <Plot
            data={slalomData}
            layout={slalomLayout}
            config={config}
            style={{ width: '100%', height: '500px' }}
          />
          
          {/* Slalom Performance Legend */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-900 text-lg mb-3">SLALOM EXERCISE</h4>
            <div className="text-blue-800 mb-3">
              <span className="font-semibold">Group Average Vehicle Control: {slalomGroupAverage}%</span>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-blue-900">Top Performers:</span>
              <ul className="mt-2 space-y-1">
                {slalomTopPerformers.map((student, index) => (
                  <li key={student.name} className="text-blue-800">
                    <span className="font-medium">{student.name}</span>: {student.slalom_control}% control, {student.slalom_attempts} attempts
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Barricade Evasion Chart */}
        <div className="mb-8">
          <Plot
            data={evasionData}
            layout={evasionLayout}
            config={config}
            style={{ width: '100%', height: '500px' }}
          />
          
          {/* Evasion Performance Legend */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-900 text-lg mb-3">BARRICADE EVASION EXERCISE</h4>
            <div className="text-green-800 mb-3">
              <span className="font-semibold">Group Average Vehicle Control: {evasionGroupAverage}%</span>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-green-900">Top Performers:</span>
              <ul className="mt-2 space-y-1">
                {evasionTopPerformers.map((student, index) => (
                  <li key={student.name} className="text-green-800">
                    <span className="font-medium">{student.name}</span>: {student.evasion_control}% control, {student.evasion_attempts} attempts
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Chart Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-primary mb-2">Chart Legend</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>Red dots = Maximum performance achieved</li>
              <li>• <span className="inline-block w-3 h-3 bg-gray-500 mr-2"></span>Grey squares = Attempts until pass</li>
              <li>• <span className="inline-block w-3 h-0.5 bg-orange-400 mr-2"></span>Orange line = Performance threshold</li>
              <li>• <span className="inline-block w-3 h-0.5 bg-gray-500 mr-2" style={{borderTop: '2px dotted #6B7280'}}></span>Dotted lines = Group averages</li>
            </ul>
          </div>
          <div className="p-4 bg-tertiary/5 rounded-lg border border-tertiary/20">
            <h4 className="font-medium text-tertiary mb-2">Performance Standards</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 80%+ Performance: Proficient in exercise</li>
              <li>• Fewer attempts: Faster skill acquisition</li>
              <li>• Consistent speed: Critical for safety</li>
            </ul>
          </div>
        </div>

        <div className="prose prose-sm max-w-none border-t pt-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
