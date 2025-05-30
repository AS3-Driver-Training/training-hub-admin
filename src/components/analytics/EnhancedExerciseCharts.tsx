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
    // Red dots for slalom max performance
    {
      type: 'scatter',
      mode: 'markers',
      x: studentNames,
      y: sortedStudents.map(s => s.slalom_control),
      marker: {
        size: 14,
        color: '#DC2626',
        symbol: 'circle'
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
        symbol: 'square'
      },
      name: 'Attempts Until Pass',
      hovertemplate: '<b>%{x}</b><br>Attempts: %{y}<extra></extra>',
      yaxis: 'y2'
    }
  ];

  const slalomLayout = {
    title: {
      text: 'Slalom Exercise Performance',
      font: { size: 18, color: '#1f2937' }
    },
    xaxis: {
      title: { text: 'Students', font: { color: '#374151' } },
      showgrid: false,
      tickangle: -45
    },
    yaxis: {
      title: { text: 'Performance %', font: { color: '#DC2626' } },
      side: 'left' as const,
      range: [0, 100],
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    yaxis2: {
      title: { text: 'Number of Attempts', font: { color: '#6B7280' } },
      side: 'right' as const,
      overlaying: 'y' as const,
      range: [0, Math.max(...sortedStudents.map(s => s.slalom_attempts)) + 2],
      showgrid: false
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      yref: 'y' as const,
      line: { color: '#FF9F1C', width: 2, dash: 'dash' as const }
    }],
    annotations: [{
      x: 0.02,
      y: 82,
      xref: 'paper' as const,
      yref: 'y' as const,
      text: '80% Performance Threshold',
      showarrow: false,
      font: { color: '#FF9F1C', size: 12 }
    }],
    margin: { l: 80, r: 80, t: 60, b: 120 },
    height: 500,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: false
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
        symbol: 'circle'
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
        symbol: 'square'
      },
      name: 'Attempts Until Pass',
      hovertemplate: '<b>%{x}</b><br>Attempts: %{y}<extra></extra>',
      yaxis: 'y2'
    }
  ];

  const evasionLayout = {
    title: {
      text: 'Barricade Evasion Exercise Performance',
      font: { size: 18, color: '#1f2937' }
    },
    xaxis: {
      title: { text: 'Students', font: { color: '#374151' } },
      showgrid: false,
      tickangle: -45
    },
    yaxis: {
      title: { text: 'Performance %', font: { color: '#DC2626' } },
      side: 'left' as const,
      range: [0, 100],
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    yaxis2: {
      title: { text: 'Number of Attempts', font: { color: '#6B7280' } },
      side: 'right' as const,
      overlaying: 'y' as const,
      range: [0, Math.max(...sortedStudents.map(s => s.evasion_attempts)) + 2],
      showgrid: false
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      yref: 'y' as const,
      line: { color: '#FF9F1C', width: 2, dash: 'dash' as const }
    }],
    annotations: [{
      x: 0.02,
      y: 82,
      xref: 'paper' as const,
      yref: 'y' as const,
      text: '80% Performance Threshold',
      showarrow: false,
      font: { color: '#FF9F1C', size: 12 }
    }],
    margin: { l: 80, r: 80, t: 60, b: 120 },
    height: 500,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: false
  };

  // Final Exercise Chart Data - using low and high stress scores
  const finalExerciseData: any[] = [
    // Red dots for low stress performance
    {
      type: 'scatter',
      mode: 'markers',
      x: studentNames,
      y: sortedStudents.map(s => s.low_stress_score),
      marker: {
        size: 14,
        color: '#DC2626',
        symbol: 'circle'
      },
      name: 'Low Stress Performance',
      hovertemplate: '<b>%{x}</b><br>Low Stress: %{y}<extra></extra>',
      yaxis: 'y'
    },
    // Blue dots for high stress performance
    {
      type: 'scatter',
      mode: 'markers',
      x: studentNames,
      y: sortedStudents.map(s => s.high_stress_score),
      marker: {
        size: 14,
        color: '#2563EB',
        symbol: 'circle'
      },
      name: 'High Stress Performance',
      hovertemplate: '<b>%{x}</b><br>High Stress: %{y}<extra></extra>',
      yaxis: 'y'
    }
  ];

  const finalExerciseLayout = {
    title: {
      text: 'Final Multidisciplinary Exercise Performance',
      font: { size: 18, color: '#1f2937' }
    },
    xaxis: {
      title: { text: 'Students', font: { color: '#374151' } },
      showgrid: false,
      tickangle: -45
    },
    yaxis: {
      title: { text: 'Performance Score', font: { color: '#374151' } },
      side: 'left' as const,
      range: [0, 100],
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 85,
      y1: 85,
      yref: 'y' as const,
      line: { color: '#FF9F1C', width: 2, dash: 'dash' as const }
    }],
    annotations: [{
      x: 0.02,
      y: 87,
      xref: 'paper' as const,
      yref: 'y' as const,
      text: '85 Proficiency Threshold',
      showarrow: false,
      font: { color: '#FF9F1C', size: 12 }
    }],
    margin: { l: 80, r: 80, t: 60, b: 120 },
    height: 500,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: false
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
          Individual student performance across all training exercises. Red dots show maximum performance achieved, grey squares show attempts until passing.
        </div>
      </CardHeader>
      <CardContent>
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
            <div className="text-sm text-green-700 bg-green-100 p-3 rounded border-l-4 border-green-400">
              <strong>What it teaches:</strong> The barricade evasion exercise simulates emergency lane changes and obstacle avoidance. 
              Students develop rapid decision-making skills, emergency braking techniques, and the ability to maintain control during 
              sudden directional changes. This exercise is essential for counter-ambush scenarios and emergency situation response.
            </div>
          </div>
        </div>

        {/* Final Exercise Chart */}
        <div className="mb-8">
          <Plot
            data={finalExerciseData}
            layout={finalExerciseLayout}
            config={config}
            style={{ width: '100%', height: '500px' }}
          />
          
          {/* Final Exercise Legend */}
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-bold text-purple-900 text-lg mb-3">FINAL MULTIDISCIPLINARY EXERCISE</h4>
            <div className="text-purple-800 mb-3">
              <span className="font-semibold">Low Stress vs High Stress Performance Comparison</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <span className="font-semibold text-red-600">● Low Stress Conditions:</span>
                <div className="text-sm text-purple-700">Standard training environment with predictable scenarios</div>
              </div>
              <div>
                <span className="font-semibold text-blue-600">● High Stress Conditions:</span>
                <div className="text-sm text-purple-700">Time pressure, multiple threats, decision complexity</div>
              </div>
            </div>
            <div className="text-sm text-purple-700 bg-purple-100 p-3 rounded border-l-4 border-purple-400">
              <strong>What it teaches:</strong> The final exercise combines all learned skills under varying stress levels to evaluate 
              real-world performance capability. It tests students' ability to maintain proficiency when facing time pressure, 
              multiple simultaneous challenges, and high-stakes decision making. This exercise identifies students who can perform 
              effectively in actual operational environments versus controlled training conditions.
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
            </ul>
          </div>
          <div className="p-4 bg-tertiary/5 rounded-lg border border-tertiary/20">
            <h4 className="font-medium text-tertiary mb-2">Performance Standards</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 80%+ Performance: Proficient in exercise</li>
              <li>• Fewer attempts: Faster skill acquisition</li>
              <li>• Final exercise: Stress response evaluation</li>
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
