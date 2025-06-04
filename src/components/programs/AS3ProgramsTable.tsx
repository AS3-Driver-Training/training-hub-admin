
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AS3ProgramRow } from "./AS3ProgramRow";
import { ProgramWithInstances, CourseInstance } from "./hooks/useAS3Programs";

interface AS3ProgramsTableProps {
  programs: ProgramWithInstances[] | undefined;
  onInquiry: (program: ProgramWithInstances) => void;
  onEnrollment: (program: ProgramWithInstances, instance: CourseInstance) => void;
}

export function AS3ProgramsTable({ programs, onInquiry, onEnrollment }: AS3ProgramsTableProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[50%]">Program</TableHead>
            <TableHead className="w-[25%]">Upcoming Sessions</TableHead>
            <TableHead className="w-[25%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6">
                No AS3 programs available at this time.
              </TableCell>
            </TableRow>
          ) : (
            programs?.map((program) => (
              <AS3ProgramRow
                key={program.id}
                program={program}
                onInquiry={onInquiry}
                onEnrollment={onEnrollment}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
