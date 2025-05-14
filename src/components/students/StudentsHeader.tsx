
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { useState } from "react";
import { AddStudentDialog } from "./AddStudentDialog";
import { ImportStudentsDialog } from "./ImportStudentsDialog";

export function StudentsHeader() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">
          Manage students, assign them to courses, and track their progress.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Student
        </Button>
        <Button variant="outline" onClick={() => setShowImportDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </div>
      
      {showAddDialog && (
        <AddStudentDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog} 
        />
      )}
      
      {showImportDialog && (
        <ImportStudentsDialog 
          open={showImportDialog} 
          onOpenChange={setShowImportDialog} 
        />
      )}
    </div>
  );
}
