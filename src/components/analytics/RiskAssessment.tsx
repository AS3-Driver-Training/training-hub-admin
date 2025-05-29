
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

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
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
