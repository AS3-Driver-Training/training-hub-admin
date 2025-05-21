
import React from "react";
import { CourseClosureData, CourseVehicle } from "@/types/programs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InfoTooltip 
                text="Add vehicles by searching for existing ones in the database or creating new ones. After creating a new vehicle, save it to the database. Note that only superadmins can edit Year and LatAcc values of saved vehicles."
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Adding Vehicles:</span> Search for existing vehicles or create new ones. 
                {!isSuperAdmin && (
                  <span className="block mt-1 text-amber-600">
                    Note: Only super admins can modify Year and LatAcc values for existing vehicles.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Car #</TableHead>
              <TableHead>Make/Model</TableHead>
              <TableHead className="w-[100px]">Year</TableHead>
              <TableHead className="w-[100px]">LatAcc</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No vehicles added yet. Click "Add Vehicle" to start.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle, i) => (
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
    </div>
  );
}
