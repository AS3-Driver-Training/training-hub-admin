import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Plot from "react-plotly.js";
import { getStressResponseCategory } from "@/services/analyticsService";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useProcessedMarkdown } from "@/hooks/useProcessedMarkdown";

interface StressPerformanceChartProps {
  studentData: AnalyticsData['student_performance_data'];
  data: {
    title: string;
    content: string;
    generated_at: string;
    has_error: boolean;
  };
}

export function StressPerformanceChart({ studentData, data }: StressPerformanceChartProps) {
  const processedContent = useProcessedMarkdown(data.content);

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

  // Create traces array with proper typing
  const traces: any[] = categories.map(category => {
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
    line: { color: '#94A3B8', dash: 'dash' as const, width: 2 },
    hoverinfo: 'skip' as const,
    showlegend: true
  });

  const layout = {
    title: {
      text: 'Stress Performance Analysis',
      font: { size: 16 }
    },
    xaxis: {
      title: { text: 'Low Stress Performance Score' },
      showgrid: true,
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: { text: 'High Stress Performance Score' },
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

  // Debug logging for markdown content
  console.log('StressPerformanceChart - Raw content:', data.content);
  console.log('StressPerformanceChart - Has ### headers:', data.content.includes('###'));
  console.log('StressPerformanceChart - Has ** bold:', data.content.includes('**'));

  // Enhanced markdown components with debug logging and !important styles
  const markdownComponents = {
    p: ({ children, ...props }: any) => {
      console.log('StressPerformanceChart - Rendering paragraph:', children);
      return <p className="mb-4 text-sm leading-relaxed text-gray-700" {...props}>{children}</p>;
    },
    strong: ({ children, ...props }: any) => {
      console.log('StressPerformanceChart - Rendering strong/bold:', children);
      return <strong className="font-semibold text-gray-900 !font-bold" {...props}>{children}</strong>;
    },
    h1: ({ children, ...props }: any) => {
      console.log('StressPerformanceChart - Rendering H1:', children);
      return <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900 !font-bold !text-2xl" {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      console.log('StressPerformanceChart - Rendering H2:', children);
      return <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-900 !font-semibold !text-xl" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      console.log('StressPerformanceChart - Rendering H3:', children);
      return <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900 !font-semibold !text-lg" {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }: any) => {
      console.log('StressPerformanceChart - Rendering H4:', children);
      return <h4 className="text-base font-semibold mt-4 mb-2 text-gray-900 !font-semibold" {...props}>{children}</h4>;
    },
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="mb-1 text-sm leading-relaxed text-gray-700">{children}</li>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">{children}</blockquote>,
    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
    pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4">{children}</pre>
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
        <div className="border-t pt-4">
          <ReactMarkdown 
            remarkPlugins={[remarkBreaks, remarkGfm]}
            components={markdownComponents}
            skipHtml={false}
            allowedElements={undefined}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
