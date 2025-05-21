
import React, { useState } from "react";
import { CourseClosureData, CourseVehicle, Vehicle } from "@/types/programs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useVehicleManager } from "../vehicles/VehicleManager";
import { VehicleTableRow } from "../vehicles/VehicleTableRow";
import { useProfile } from "@/hooks/useProfile";
import { VehicleFormDialog } from "../vehicles/VehicleFormDialog";
import { toast } from "sonner";

interface VehiclesStepProps {
  formData: Partial<CourseClosureData>;
  onUpdate: (data: Partial<CourseClosureData>) => void;
}

export function VehiclesStep({ formData, onUpdate }: VehiclesStepProps) {
  // Get user role to determine permissions
  const { userRole } = useProfile();
  const isSuperAdmin = userRole === "superadmin";
  
  // State for vehicle dialog
  const [editingVehicleIndex, setEditingVehicleIndex] = useState<number | null>(null);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  
  // Initialize vehicles array with existing data or empty array
  const vehicles = formData.vehicles && formData.vehicles.length > 0 ? formData.vehicles : [];
  
  // Use our vehicle manager hook to handle vehicle operations
  const {
    handleAddVehicle,
    handleRemoveVehicle,
    handleUpdateVehicle,
    handleSelectVehicle,
    handleClearVehicle,
    isVehicleSelected,
    getVehicleDbId
  } = useVehicleManager({
    vehicles,
    onVehiclesChange: (updatedVehicles) => {
      onUpdate({ vehicles: updatedVehicles });
    }
  });

  // Handle edit button click
  const handleEditVehicle = (index: number) => {
    setEditingVehicleIndex(index);
    setDialogMode('edit');
    setIsVehicleDialogOpen(true);
  };

  // Handle vehicle update from dialog
  const handleVehicleUpdated = (vehicle: Vehicle) => {
    if (editingVehicleIndex !== null) {
      // Update vehicle details in the list
      handleSelectVehicle(editingVehicleIndex, vehicle);
      toast.success(`Vehicle updated successfully`);
    }
    
    // Reset state
    setEditingVehicleIndex(null);
    setIsVehicleDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Course Vehicles</h3>
          <InfoTooltip 
            text="Add vehicles used during the course. Search for existing vehicles or enter new ones directly."
            side="top"
          />
        </div>
      </div>
      
      <div className="border rounded-md p-4">
        {!isSuperAdmin && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> You can search for vehicles and add new ones. 
                  Only superadmins can edit vehicle details in the database.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Car #</TableHead>
              <TableHead>Make/Model</TableHead>
              <TableHead className="w-[100px]">Year</TableHead>
              <TableHead className="w-[100px]">LatAcc</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading vehicles...
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle, i) => (
                <VehicleTableRow
                  key={i}
                  vehicle={vehicle}
                  index={i}
                  isSelected={isVehicleSelected(i)}
                  dbId={getVehicleDbId(i)}
                  onUpdate={handleUpdateVehicle}
                  onRemove={handleRemoveVehicle}
                  onSelectVehicle={handleSelectVehicle}
                  onClearVehicle={handleClearVehicle}
                  onEditVehicle={handleEditVehicle}
                />
              ))
            )}
          </TableBody>
        </Table>
        
        <div className="mt-4">
          <Button 
            type="button" 
            onClick={handleAddVehicle}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>
      
      {/* Vehicle Edit Dialog */}
      {editingVehicleIndex !== null && (
        <VehicleFormDialog
          open={isVehicleDialogOpen}
          onClose={() => {
            setIsVehicleDialogOpen(false);
            setEditingVehicleIndex(null);
          }}
          onVehicleCreated={handleVehicleUpdated}
          initialMake={vehicles[editingVehicleIndex]?.make || ""}
          initialModel={vehicles[editingVehicleIndex]?.model || ""}
          initialYear={vehicles[editingVehicleIndex]?.year}
          initialLatAcc={vehicles[editingVehicleIndex]?.latAcc}
          vehicleId={getVehicleDbId(editingVehicleIndex)}
          mode={dialogMode}
        />
      )}
    </div>
  );
}
