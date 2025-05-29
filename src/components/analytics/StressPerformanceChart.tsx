
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Plot from "react-plotly.js";
import { getStressResponseCategory } from "@/services/analyticsService";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";

interface StressPerformanceChartProps {
  studentData: AnalyticsData['student_performance_data'];
  content: string;
}

export function StressPerformanceChart({ studentData, content }: StressPerformanceChartProps) {
  const scatterData = studentData.map(student => {
    const stressResponse = getStressResponseCategory(student.low_stress_score, student.high_stress_score);
    return {
      x: student.low_stress_score,
      y: student.high_stress_score,
      name: student.name,
      color: stressResponse.color,
      category: stressResponse.category
    };
  });

  // Group by category for legend
  const categories = ['enhanced', 'resilient', 'affected'];
  const categoryColors = {
    enhanced: '#10B981',
    resilient: '#3B82F6', 
    affected: '#F59E0B'
  };
  
  const categoryLabels = {
    enhanced: 'Stress Enhanced',
    resilient: 'Stress Resilient',
    affected: 'Stress Affected'
  };

  const traces = categories.map(category => {
    const categoryData = scatterData.filter(d => d.category === category);
    return {
      type: 'scatter' as const,
      mode: 'markers' as const,
      x: categoryData.map(d => d.x),
      y: categoryData.map(d => d.y),
      text: categoryData.map(d => d.name),
      name: categoryLabels[category as keyof typeof categoryLabels],
      marker: {
        color: categoryColors[category as keyof typeof categoryColors],
        size: 10,
        line: { width: 2, color: 'white' }
      },
      hovertemplate: '<b>%{text}</b><br>Low Stress: %{x}<br>High Stress: %{y}<extra></extra>'
    };
  });

  // Add diagonal reference line
  const minScore = Math.min(...scatterData.map(d => Math.min(d.x, d.y)));
  const maxScore = Math.max(...scatterData.map(d => Math.max(d.x, d.y)));
  
  traces.push({
    type: 'scatter' as const,
    mode: 'lines' as const,
    x: [minScore, maxScore],
    y: [minScore, maxScore],
    name: 'Equal Performance',
    line: { color: '#94A3B8', dash: 'dash', width: 2 },
    hoverinfo: 'skip' as const,
    showlegend: true
  });

  const layout = {
    title: {
      text: 'Stress Performance Analysis',
      font: { size: 16 }
    },
    xaxis: {
      title: 'Low Stress Performance Score',
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: 'High Stress Performance Score',
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    margin: { l: 50, r: 50, t: 50, b: 50 },
    height: 500,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#e2e8f0',
      borderwidth: 1
    }
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Plot
            data={traces}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '500px' }}
          />
        </div>
        <div className="prose prose-sm max-w-none border-t pt-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
