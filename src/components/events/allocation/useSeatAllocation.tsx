
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Allocation } from "./hooks/useAllocationData";

export function useSeatAllocation(existingAllocations: any[] | undefined, courseInstance: any) {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [remainingSeats, setRemainingSeats] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);

  // Update allocations state when existing allocations are fetched
  useEffect(() => {
    if (existingAllocations) {
      const formattedAllocations = existingAllocations.map(allocation => ({
        id: allocation.id,
        clientId: allocation.client?.id || '',
        clientName: allocation.client?.name || '',
        seatsAllocated: allocation.seats_allocated
      }));
      
      setAllocations(formattedAllocations);
      updateRemainingSeats(formattedAllocations);
    }
  }, [existingAllocations, courseInstance]);

  // Update remaining seats calculation
  const updateRemainingSeats = (currentAllocations: Allocation[]) => {
    if (courseInstance?.program?.max_students) {
      const totalAllocated = currentAllocations.reduce(
        (sum, allocation) => sum + allocation.seatsAllocated, 
        0
      );
      setRemainingSeats(courseInstance.program.max_students - totalAllocated);
    }
  };

  // Add a new allocation
  const handleAddAllocation = (values: {clientId: string; seatsAllocated: number;}, clients: any[] | undefined) => {
    // Check if client already has an allocation
    const existingIndex = allocations.findIndex(a => a.clientId === values.clientId);
    
    // Check if there are enough seats left
    if (values.seatsAllocated > remainingSeats) {
      return { error: `Cannot allocate more than the remaining ${remainingSeats} seats` };
    }

    if (existingIndex >= 0) {
      // Update existing allocation
      const updatedAllocations = [...allocations];
      updatedAllocations[existingIndex].seatsAllocated += values.seatsAllocated;
      setAllocations(updatedAllocations);
      updateRemainingSeats(updatedAllocations);
    } else {
      // Add new allocation
      const clientName = clients?.find(c => c.id === values.clientId)?.name || '';
      const newAllocations = [
        ...allocations,
        {
          clientId: values.clientId,
          clientName,
          seatsAllocated: values.seatsAllocated
        }
      ];
      setAllocations(newAllocations);
      updateRemainingSeats(newAllocations);
    }

    // Hide form
    setShowAddForm(false);
    
    toast({
      title: "Allocation Added",
      description: "The seat allocation has been added successfully.",
    });
    
    return { success: true };
  };

  // Remove an allocation
  const handleRemoveAllocation = (index: number) => {
    const clientName = allocations[index].clientName;
    const seatsAllocated = allocations[index].seatsAllocated;
    
    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    setAllocations(newAllocations);
    updateRemainingSeats(newAllocations);
    
    toast({
      title: "Allocation Removed",
      description: `Removed ${seatsAllocated} seats for ${clientName}.`,
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    const maxStudents = courseInstance?.program?.max_students || 0;
    const totalAllocated = allocations.reduce(
      (sum, allocation) => sum + allocation.seatsAllocated, 
      0
    );
    const allocationPercentage = maxStudents > 0 ? (totalAllocated / maxStudents) * 100 : 0;

    return {
      totalAllocated,
      maxStudents,
      allocationPercentage
    };
  };

  return {
    allocations,
    remainingSeats,
    showAddForm,
    setShowAddForm,
    handleAddAllocation,
    handleRemoveAllocation,
    calculateTotals
  };
}
