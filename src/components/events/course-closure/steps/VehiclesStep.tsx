
import React from "react";
import { CourseClosureData, CourseVehicle } from "@/types/programs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useVehicleManager } from "../vehicles/VehicleManager";
import { VehicleTableRow } from "../vehicles/VehicleTableRow";
import { useProfile } from "@/hooks/useProfile";

interface VehiclesStepProps {
  formData: Partial<CourseClosureData>;
  onUpdate: (data: Partial<CourseClosureData>) => void;
}

export function VehiclesStep({ formData, onUpdate }: VehiclesStepProps) {
  // Get user role to determine permissions
  const { userRole } = useProfile();
  const isSuperAdmin = userRole === "superadmin";
  
  // Initialize vehicles array with existing data or empty array
  const vehicles = formData.vehicles && formData.vehicles.length > 0 ? formData.vehicles : [];
  
  // Use our vehicle manager hook to handle vehicle operations
  const {
    handleAddVehicle,
    handleRemoveVehicle,
    handleUpdateVehicle,
    handleSaveToDatabase,
    isVehicleNew,
    isVehicleSavedToDb
  } = useVehicleManager({
    vehicles,
    onVehiclesChange: (updatedVehicles) => {
      onUpdate({ vehicles: updatedVehicles });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Course Vehicles</h3>
          <InfoTooltip 
            text="Add all vehicles used during the course. You can search for existing vehicles or add new ones."
            side="top"
          />
        </div>
      </div>
      
      <div className="border rounded-md p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Add all vehicles used during this course program. Each vehicle requires a make/model and lateral acceleration value.
          {!isSuperAdmin && (
            <span className="block mt-2 text-amber-600">
              Note: Only super admins can modify Year and LatAcc values for existing vehicles.
            </span>
          )}
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Car #</TableHead>
              <TableHead>Make/Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>LatAcc</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle, i) => (
              <VehicleTableRow
                key={i}
                vehicle={vehicle}
                index={i}
                isNewVehicle={isVehicleNew(i)}
                isSavedToDb={isVehicleSavedToDb(i)}
                onUpdate={handleUpdateVehicle}
                onRemove={handleRemoveVehicle}
                onSaveToDatabase={handleSaveToDatabase}
              />
            ))}
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
    </div>
  );
}
