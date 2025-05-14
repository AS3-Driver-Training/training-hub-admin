
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentWithRelations } from "@/types/students";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./manage/ProfileTab";
import { CoursesTab } from "./manage/CoursesTab";

interface ManageStudentDialogProps {
  student: StudentWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageStudentDialog({ student, open, onOpenChange }: ManageStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Student: {student.first_name} {student.last_name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full mt-4">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="courses" className="flex-1">Courses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileTab student={student} />
          </TabsContent>
          
          <TabsContent value="courses">
            <CoursesTab student={student} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
