
import { Plus, Trash2, Users } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Allocation {
  id?: number;
  clientId: string;
  clientName: string;
  seatsAllocated: number;
}

interface AllocationsTableProps {
  allocations: Allocation[];
  onRemoveAllocation: (index: number) => void;
  showAddForm: boolean;
  remainingSeats: number;
  setShowAddForm: (show: boolean) => void;
}

export function AllocationsTable({ 
  allocations, 
  onRemoveAllocation, 
  showAddForm, 
  remainingSeats,
  setShowAddForm
}: AllocationsTableProps) {
  if (allocations.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-slate-50">
        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-base font-medium mb-1">No seat allocations yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Assign available seats to clients for this course
        </p>
        {!showAddForm && remainingSeats > 0 && (
          <Button 
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Seats
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-medium">Client</TableHead>
            <TableHead className="text-right font-medium">Seats</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocations.map((allocation, index) => (
            <TableRow key={index} className="hover:bg-slate-50">
              <TableCell className="font-medium">{allocation.clientName}</TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className="font-medium">
                  {allocation.seatsAllocated}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveAllocation(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-rose-600" />
                  <span className="sr-only">Remove</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
