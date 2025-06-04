
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useAS3Programs } from "./hooks/useAS3Programs";
import { useAS3ProgramDialogs } from "./hooks/useAS3ProgramDialogs";
import { AS3ProgramsGrid } from "./AS3ProgramsGrid";
import { InquiryDialog } from "./InquiryDialog";
import { EnrollmentDialog } from "./EnrollmentDialog";

export function AS3ProgramsForClients() {
  const { data: programs, isLoading } = useAS3Programs();
  const {
    selectedProgram,
    selectedInstance,
    inquiryDialogOpen,
    enrollmentDialogOpen,
    handleInquiry,
    handleEnrollment,
    closeInquiryDialog,
    closeEnrollmentDialog,
  } = useAS3ProgramDialogs();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading AS3 programs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <CardTitle>AS3 Training Programs</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <AS3ProgramsGrid
          programs={programs}
          onInquiry={handleInquiry}
          onEnrollment={handleEnrollment}
        />
      </CardContent>

      {/* Dialogs */}
      <InquiryDialog
        open={inquiryDialogOpen}
        onClose={closeInquiryDialog}
        program={selectedProgram}
      />
      
      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onClose={closeEnrollmentDialog}
        program={selectedProgram}
        instance={selectedInstance}
      />
    </Card>
  );
}
