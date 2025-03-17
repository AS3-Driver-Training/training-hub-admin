
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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ProgramsTableProps {
  programs: Program[];
  onEdit: (program: Program) => void;
  onDelete: (programId: string) => void;
}

export function ProgramsTable({ programs, onEdit, onDelete }: ProgramsTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

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

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programId) 
        ? prev.filter(id => id !== programId) 
        : [...prev, programId]
    );
  };

  const toggleAllPrograms = () => {
    if (selectedPrograms.length === programs.length) {
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms(programs.map(p => p.id));
    }
  };

  const getLevelBadgeColor = (level: string): string => {
    switch(level) {
      case "Basic": return "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800";
      case "Intermediate": return "bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800";
      case "Advanced": return "bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800";
    }
  };

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedPrograms.length === programs.length && programs.length > 0}
                  onCheckedChange={toggleAllPrograms}
                  aria-label="Select all programs"
                />
              </TableHead>
              <TableHead className="w-[40%]">Program</TableHead>
              <TableHead className="w-[20%]">Duration & Students</TableHead>
              <TableHead className="w-[15%]">SKU & Price</TableHead>
              <TableHead className="w-[15%]">Level</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No programs found. Create your first program to get started.
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.id} className="border-t">
                  <TableCell>
                    <Checkbox 
                      checked={selectedPrograms.includes(program.id)} 
                      onCheckedChange={() => toggleProgramSelection(program.id)}
                      aria-label={`Select ${program.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{program.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {program.id.substring(0, 6)}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {program.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Duration: <span className="text-muted-foreground">{program.durationDays} days</span></div>
                      <div>Students: <span className="text-muted-foreground">{program.minStudents} - {program.maxStudents}</span></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>SKU: <span className="text-muted-foreground">{program.sku}</span></div>
                      <div>Price: <span className="text-muted-foreground">${program.price}</span></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getLevelBadgeColor(program.lvl)}
                    >
                      Level {program.lvl === "Basic" ? "1" : 
                             program.lvl === "Intermediate" ? "2" : "3"}
                    </Badge>
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
      </div>

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
