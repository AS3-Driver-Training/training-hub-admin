
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Program } from "@/types/programs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ProgramsTableProps {
  programs: Program[];
  onEdit: (program: Program) => void;
  onDelete: (programId: string) => void;
}

export function ProgramsTable({ programs, onEdit, onDelete }: ProgramsTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);

  const handleDeleteClick = (program: Program) => {
    setProgramToDelete(program);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (programToDelete) {
      onDelete(programToDelete.id);
      setIsDeleteDialogOpen(false);
      setProgramToDelete(null);
    }
  };

  // Helper function to get badge color based on level
  const getLevelBadgeVariant = (level: string): "default" | "secondary" | "outline" => {
    switch(level) {
      case "Basic": return "default";
      case "Intermediate": return "secondary";
      case "Advanced": return "outline";
      default: return "default";
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Program</TableHead>
            <TableHead className="w-1/3">Details</TableHead>
            <TableHead className="w-1/3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6">
                No programs found. Create your first program to get started.
              </TableCell>
            </TableRow>
          ) : (
            programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell>
                  <div className="font-medium">{program.name}</div>
                  <div className="text-sm text-muted-foreground">{program.sku}</div>
                  <div className="mt-1">
                    <Badge variant={getLevelBadgeVariant(program.lvl)}>
                      LVL{program.lvl === "Basic" ? "1" : program.lvl === "Intermediate" ? "2" : "3"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    <div>Duration: {program.durationDays} days</div>
                    <div>Students: {program.minStudents} - {program.maxStudents}</div>
                    <div>Price: ${program.price.toLocaleString()}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(program)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(program)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the program{" "}
              <strong>{programToDelete?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
