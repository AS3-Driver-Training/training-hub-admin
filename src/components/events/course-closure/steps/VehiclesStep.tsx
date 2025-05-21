
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

interface VehiclesStepProps {
  formData: Partial<CourseClosureData>;
  onUpdate: (data: Partial<CourseClosureData>) => void;
}

export function VehiclesStep({ formData, onUpdate }: VehiclesStepProps) {
  // Get user role to determine permissions
  const { userRole } = useProfile();
  const isSuperAdmin = userRole === "superadmin";
  
  // State for editing vehicle
  const [editingVehicleIndex, setEditingVehicleIndex] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Initialize vehicles array with existing data or empty array
  const vehicles = formData.vehicles && formData.vehicles.length > 0 ? formData.vehicles : [];
  
  // Use our vehicle manager hook to handle vehicle operations
  const {
    handleAddVehicle,
    handleRemoveVehicle,
    handleUpdateVehicle,
    handleSelectVehicle,
    handleTriggerCreateVehicle,
    isVehicleNew,
    isVehicleSelected
  } = useVehicleManager({
    vehicles,
    onVehiclesChange: (updatedVehicles) => {
      onUpdate({ vehicles: updatedVehicles });
    }
  });

  // Handle vehicle edit button click
  const handleEditVehicle = (index: number) => {
    setEditingVehicleIndex(index);
    setIsEditDialogOpen(true);
  };

  // Handle vehicle creation from dialog
  const handleVehicleCreated = (vehicle: Vehicle) => {
    if (editingVehicleIndex !== null) {
      // If we're editing, update the existing vehicle
      handleUpdateVehicle(editingVehicleIndex, 'make', `${vehicle.make} ${vehicle.model}`.trim());
      handleUpdateVehicle(editingVehicleIndex, 'year', vehicle.year);
      handleUpdateVehicle(editingVehicleIndex, 'latAcc', vehicle.latAcc);
    }
    setEditingVehicleIndex(null);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Course Vehicles</h3>
          <InfoTooltip 
            text="Add vehicles used during the course. Search for existing vehicles or create new ones."
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
                  <span className="font-medium">Note:</span> Only superadmins can edit vehicle details after selection.
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
                  isNewVehicle={isVehicleNew(i)}
                  isSelected={isVehicleSelected(i)}
                  onUpdate={handleUpdateVehicle}
                  onRemove={handleRemoveVehicle}
                  onSelectVehicle={handleSelectVehicle}
                  onTriggerCreateVehicle={handleTriggerCreateVehicle}
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
      
      {/* Edit Vehicle Dialog */}
      {editingVehicleIndex !== null && (
        <VehicleFormDialog
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingVehicleIndex(null);
          }}
          onVehicleCreated={handleVehicleCreated}
          initialMakeModel={vehicles[editingVehicleIndex]?.make || ""}
        />
      )}
    </div>
  );
}
