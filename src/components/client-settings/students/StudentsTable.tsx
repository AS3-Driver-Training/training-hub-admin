
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentTableRow } from "./StudentTableRow";

interface ClientStudent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  employee_number: string | null;
  phone: string | null;
  total_enrollments: number;
  last_course_date: string | null;
  teams: {
    name: string;
    groups: {
      name: string;
    };
  };
}

interface StudentsTableProps {
  students: ClientStudent[];
}

export function StudentsTable({ students }: StudentsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[35%]">Student</TableHead>
            <TableHead className="w-[25%]">Contact</TableHead>
            <TableHead className="w-[20%]">Team/Group</TableHead>
            <TableHead className="w-[15%]">Activity</TableHead>
            <TableHead className="w-[5%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <StudentTableRow key={student.id} student={student} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
