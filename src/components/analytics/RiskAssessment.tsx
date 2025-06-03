
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useProcessedMarkdown } from "@/hooks/useProcessedMarkdown";

interface RiskAssessmentProps {
  data: {
    title: string;
    content: string;
    generated_at: string;
    has_error: boolean;
  };
}

export function RiskAssessment({ data }: RiskAssessmentProps) {
  const processedContent = useProcessedMarkdown(data.content);

  // Enhanced markdown components with debug logging and !important styles
  const markdownComponents = {
    p: ({ children, ...props }: any) => {
      console.log('RiskAssessment - Rendering paragraph:', children);
      return <p className="mb-4 text-sm leading-relaxed text-gray-700" {...props}>{children}</p>;
    },
    strong: ({ children, ...props }: any) => {
      console.log('RiskAssessment - Rendering strong/bold:', children);
      return <strong className="font-semibold text-gray-900 !font-bold" {...props}>{children}</strong>;
    },
    h1: ({ children, ...props }: any) => {
      console.log('RiskAssessment - Rendering H1:', children);
      return <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900 !font-bold !text-2xl" {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      console.log('RiskAssessment - Rendering H2:', children);
      return <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-900 !font-semibold !text-xl" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      console.log('RiskAssessment - Rendering H3:', children);
      return <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900 !font-semibold !text-lg" {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }: any) => {
      console.log('RiskAssessment - Rendering H4:', children);
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
        <CardTitle>Risk Assessment & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
