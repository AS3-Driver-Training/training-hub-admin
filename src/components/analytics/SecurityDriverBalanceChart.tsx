
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Plot from "react-plotly.js";
import { AnalyticsData } from "@/types/analytics";

interface SecurityDriverBalanceChartProps {
  studentData: AnalyticsData['student_performance_data'];
}

export function SecurityDriverBalanceChart({ studentData }: SecurityDriverBalanceChartProps) {
  // Filter students who have the required data
  const validStudents = studentData.filter(student => 
    student.final_result !== undefined && 
    student.slalom_control !== undefined && 
    student.evasion_control !== undefined
  );

  if (validStudents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Security Driver Balance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No data available for Security Driver Balance analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average of slalom and lane change (evasion) for each student
  const chartData = validStudents.map(student => ({
    x: (student.slalom_control + student.evasion_control) / 2,
    y: student.final_result || 0,
    text: student.name,
    penalties: student.penalties || 0,
    reverseTime: student.reverse_time || 0,
  }));

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
        title: 'Penalties',
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
      <CardContent className="space-y-4">
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '500px' }}
        />
        
        {/* Legend and explanation */}
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
      </CardContent>
    </Card>
  );
}
