
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface RiskAssessmentProps {
  content: string;
}

export function RiskAssessment({ content }: RiskAssessmentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkBreaks, remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-4">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              h3: ({ children }) => <h3 className="text-lg font-semibold mt-6 mb-3">{children}</h3>,
              h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-4">{children}</h2>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
              li: ({ children }) => <li className="mb-1">{children}</li>
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
