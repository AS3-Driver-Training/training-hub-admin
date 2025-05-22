
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotesCardProps {
  notes?: string;
}

export function NotesCard({ notes }: NotesCardProps) {
  if (!notes) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{notes}</p>
      </CardContent>
    </Card>
  );
}
