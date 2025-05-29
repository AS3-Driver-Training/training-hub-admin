
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Plot from "react-plotly.js";
import { calculatePerformanceTiers } from "@/services/analyticsService";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";

interface PerformanceDistributionChartProps {
  studentData: AnalyticsData['student_performance_data'];
  content: string;
}

export function PerformanceDistributionChart({ studentData, content }: PerformanceDistributionChartProps) {
  const tiers = calculatePerformanceTiers(studentData);

  const data = [{
    type: 'bar' as const,
    orientation: 'h' as const,
    x: tiers.map(tier => tier.count),
    y: tiers.map(tier => tier.name),
    marker: {
      color: tiers.map(tier => tier.color)
    },
    text: tiers.map(tier => `${tier.count} (${tier.percentage}%)`),
    textposition: 'outside' as const,
    hovertemplate: '<b>%{y}</b><br>Students: %{x}<br>Percentage: %{text}<extra></extra>'
  }];

  const layout = {
    title: {
      text: 'Performance Distribution',
      font: { size: 16 }
    },
    xaxis: {
      title: { text: 'Number of Students' },
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: { text: '' },
      automargin: true
    },
    margin: { l: 150, r: 50, t: 50, b: 50 },
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
        <CardTitle>Performance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Plot
            data={data}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '400px' }}
          />
        </div>
        <div className="prose prose-sm max-w-none border-t pt-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
