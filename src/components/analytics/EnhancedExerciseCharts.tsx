
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

  // Performance vs Attempts Scatter Plot for Slalom
  const slalomScatterData = [{
    type: 'scatter' as const,
    mode: 'markers+text' as const,
    x: sortedStudents.map(s => s.slalom_attempts),
    y: sortedStudents.map(s => s.slalom_control),
    text: sortedStudents.map(s => s.name.split(' ').map(n => n[0]).join('')),
    textposition: 'middle center' as const,
    marker: {
      size: 16,
      color: sortedStudents.map(s => s.slalom_control >= 80 ? '#10B981' : '#EF4444'),
      line: { width: 2, color: 'white' }
    },
    hovertemplate: '<b>%{text}</b><br>Performance: %{y}%<br>Attempts: %{x}<extra></extra>',
    name: 'Students'
  }];

  const slalomLayout = {
    title: {
      text: 'Slalom Exercise: Performance % vs Attempts',
      font: { size: 16 }
    },
    xaxis: {
      title: { text: 'Number of Attempts' },
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: { text: 'Vehicle Control Performance %' },
      range: [0, 100],
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      line: { color: '#F59E0B', width: 2, dash: 'dash' as const }
    }],
    annotations: [{
      x: 0.02,
      y: 82,
      xref: 'paper' as const,
      yref: 'y' as const,
      text: '80% Performance Threshold',
      showarrow: false,
      font: { color: '#F59E0B', size: 12 }
    }],
    margin: { l: 60, r: 50, t: 60, b: 60 },
    height: 400,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: false
  };

  // Performance vs Attempts Scatter Plot for Evasion
  const evasionScatterData = [{
    type: 'scatter' as const,
    mode: 'markers+text' as const,
    x: sortedStudents.map(s => s.evasion_attempts),
    y: sortedStudents.map(s => s.evasion_control),
    text: sortedStudents.map(s => s.name.split(' ').map(n => n[0]).join('')),
    textposition: 'middle center' as const,
    marker: {
      size: 16,
      color: sortedStudents.map(s => s.evasion_control >= 80 ? '#10B981' : '#EF4444'),
      line: { width: 2, color: 'white' }
    },
    hovertemplate: '<b>%{text}</b><br>Performance: %{y}%<br>Attempts: %{x}<extra></extra>',
    name: 'Students'
  }];

  const evasionLayout = {
    title: {
      text: 'Barricade Evasion: Performance % vs Attempts',
      font: { size: 16 }
    },
    xaxis: {
      title: { text: 'Number of Attempts' },
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: { text: 'Vehicle Control Performance %' },
      range: [0, 100],
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      line: { color: '#F59E0B', width: 2, dash: 'dash' as const }
    }],
    annotations: [{
      x: 0.02,
      y: 82,
      xref: 'paper' as const,
      yref: 'y' as const,
      text: '80% Performance Threshold',
      showarrow: false,
      font: { color: '#F59E0B', size: 12 }
    }],
    margin: { l: 60, r: 50, t: 60, b: 60 },
    height: 400,
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
        <CardTitle>Exercise Performance Analysis</CardTitle>
        <div className="text-sm text-gray-600">
          Performance % represents vehicle control mastery in each exercise. This differs from overall score which encompasses all training aspects.
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          <div>
            <Plot
              data={slalomScatterData}
              layout={slalomLayout}
              config={config}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
          <div>
            <Plot
              data={evasionScatterData}
              layout={evasionLayout}
              config={config}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </div>
        
        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Lower attempts = Better initial skill acquisition</li>
              <li>• Performance % = Vehicle control mastery per exercise</li>
              <li>• Overall Score = Comprehensive training assessment</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Performance Standards</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• 80%+ Performance: Proficient vehicle control</li>
              <li>• Fewer attempts: Faster skill mastery</li>
              <li>• Consistent performance across exercises preferred</li>
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
