
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentListSelection } from "./selection/StudentListSelection";
import { StudentFileImport } from "./selection/StudentFileImport";
import { StudentForm } from "./StudentForm";
import { StudentFormValues } from "./types";

interface EnhancedStudentSelectionProps {
  courseInstanceId: number;
  clientId: string;
  isOpenEnrollment: boolean;
  availableSeats: number;
  onAddStudent: (student: StudentFormValues) => Promise<void>;
  onClose: () => void;
}

export function EnhancedStudentSelection({
  courseInstanceId,
  clientId,
  isOpenEnrollment,
  availableSeats,
  onAddStudent,
  onClose
}: EnhancedStudentSelectionProps) {
  const [activeTab, setActiveTab] = useState<string>("list");
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Select from List</TabsTrigger>
          <TabsTrigger value="import">Import File</TabsTrigger>
          <TabsTrigger value="individual">Add Individual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="pt-4">
          <StudentListSelection 
            clientId={clientId} 
            courseInstanceId={courseInstanceId}
            isOpenEnrollment={isOpenEnrollment}
            availableSeats={availableSeats}
            onClose={onClose}
          />
        </TabsContent>
        
        <TabsContent value="import" className="pt-4">
          <StudentFileImport 
            clientId={clientId} 
            courseInstanceId={courseInstanceId}
            isOpenEnrollment={isOpenEnrollment}
            availableSeats={availableSeats}
            onClose={onClose}
          />
        </TabsContent>
        
        <TabsContent value="individual" className="pt-4">
          <StudentForm 
            onAddStudent={onAddStudent}
            onCancel={onClose}
            availableSeats={availableSeats}
            isOpenEnrollment={isOpenEnrollment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
