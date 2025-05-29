
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Plot from "react-plotly.js";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";

interface ExercisePerformanceChartsProps {
  studentData: AnalyticsData['student_performance_data'];
  content: string;
}

export function ExercisePerformanceCharts({ studentData, content }: ExercisePerformanceChartsProps) {
  // Sort students by overall score for consistent ordering
  const sortedStudents = [...studentData].sort((a, b) => b.overall_score - a.overall_score);

  // Slalom Performance Chart
  const slalomData = [{
    type: 'bar' as const,
    x: sortedStudents.map(s => s.name),
    y: sortedStudents.map(s => s.slalom_control),
    name: 'Vehicle Control %',
    marker: {
      color: sortedStudents.map(s => s.slalom_control >= 80 ? '#10B981' : '#EF4444')
    },
    hovertemplate: '<b>%{x}</b><br>Control: %{y}%<extra></extra>'
  }];

  const slalomLayout = {
    title: {
      text: 'Slalom Exercise Performance',
      font: { size: 16 }
    },
    xaxis: {
      title: 'Students',
      tickangle: -45
    },
    yaxis: {
      title: 'Vehicle Control %',
      range: [0, 100]
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      line: { color: '#F59E0B', width: 2, dash: 'dash' }
    }],
    annotations: [{
      x: 0.02,
      y: 82,
      xref: 'paper' as const,
      yref: 'y' as const,
      text: '80% Security Threshold',
      showarrow: false,
      font: { color: '#F59E0B', size: 12 }
    }],
    margin: { l: 50, r: 50, t: 50, b: 100 },
    height: 400,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white'
  };

  // Barricade Evasion Performance Chart
  const evasionData = [{
    type: 'bar' as const,
    x: sortedStudents.map(s => s.name),
    y: sortedStudents.map(s => s.evasion_control),
    name: 'Vehicle Control %',
    marker: {
      color: sortedStudents.map(s => s.evasion_control >= 80 ? '#10B981' : '#EF4444')
    },
    hovertemplate: '<b>%{x}</b><br>Control: %{y}%<extra></extra>'
  }];

  const evasionLayout = {
    title: {
      text: 'Barricade Evasion Performance',
      font: { size: 16 }
    },
    xaxis: {
      title: 'Students',
      tickangle: -45
    },
    yaxis: {
      title: 'Vehicle Control %',
      range: [0, 100]
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      line: { color: '#F59E0B', width: 2, dash: 'dash' }
    }],
    annotations: [{
      x: 0.02,
      y: 82,
      xref: 'paper' as const,
      yref: 'y' as const,
      text: '80% Security Threshold',
      showarrow: false,
      font: { color: '#F59E0B', size: 12 }
    }],
    margin: { l: 50, r: 50, t: 50, b: 100 },
    height: 400,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white'
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Performance Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <Plot
              data={slalomData}
              layout={slalomLayout}
              config={config}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
          <div>
            <Plot
              data={evasionData}
              layout={evasionLayout}
              config={config}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </div>
        <div className="prose prose-sm max-w-none border-t pt-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
