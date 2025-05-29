
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface ExecutiveSummaryProps {
  data: {
    title: string;
    content: string;
    generated_at: string;
    has_error: boolean;
  };
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {data.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{data.content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
