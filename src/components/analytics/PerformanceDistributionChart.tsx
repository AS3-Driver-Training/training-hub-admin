
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Plot from "react-plotly.js";
import { calculatePerformanceTiers } from "@/services/analyticsService";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useProcessedMarkdown } from "@/hooks/useProcessedMarkdown";

interface PerformanceDistributionChartProps {
  studentData: AnalyticsData['student_performance_data'];
  data: {
    title: string;
    content: string;
    generated_at: string;
    has_error: boolean;
  };
}

export function PerformanceDistributionChart({ studentData, data }: PerformanceDistributionChartProps) {
  const processedContent = useProcessedMarkdown(data.content);
  const tiers = calculatePerformanceTiers(studentData);

  const chartData = [{
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
            data={chartData}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '400px' }}
          />
        </div>
        <div className="border-t pt-4">
          <ReactMarkdown 
            remarkPlugins={[remarkBreaks, remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-4 text-sm leading-relaxed text-gray-700">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
              h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-900">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">{children}</h3>,
              h4: ({ children }) => <h4 className="text-base font-semibold mt-4 mb-2 text-gray-900">{children}</h4>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="mb-1 text-sm leading-relaxed text-gray-700">{children}</li>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">{children}</blockquote>,
              code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
              pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4">{children}</pre>
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
