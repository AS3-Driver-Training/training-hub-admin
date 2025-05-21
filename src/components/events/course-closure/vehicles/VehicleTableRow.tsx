
import React from "react";
import { CourseVehicle, Vehicle } from "@/types/programs";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Trash, Save, Edit } from "lucide-react";
import { VehicleSearch } from "./VehicleSearch";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface VehicleTableRowProps {
  vehicle: CourseVehicle;
  index: number;
  isNewVehicle: boolean;
  isSavedToDb: boolean;
  isSelected: boolean;
  onUpdate: (index: number, field: keyof CourseVehicle, value: any) => void;
  onRemove: (index: number) => void;
  onSaveToDatabase: (index: number) => void;
  onSelectVehicle: (index: number, vehicle: Vehicle) => void;
  onCreateNewVehicle: (index: number, makeModel: string) => void;
}

export function VehicleTableRow({
  vehicle,
  index,
  isNewVehicle,
  isSavedToDb,
  isSelected,
  onUpdate,
  onRemove,
  onSaveToDatabase,
  onSelectVehicle,
  onCreateNewVehicle
}: VehicleTableRowProps) {
  const { userRole } = useProfile();
  const isSuperAdmin = userRole === "superadmin";

  // Determine which fields can be edited by the current user
  // Year and latAcc fields are locked for non-superadmins if the vehicle is selected or saved
  const canEditSensitiveFields = isSuperAdmin || (!isSelected && !isSavedToDb);
  
  return (
    <TableRow className={isNewVehicle && isSelected ? "bg-blue-50" : ""}>
      <TableCell>
        <div className="w-20 text-center py-2">{vehicle.car}</div>
      </TableCell>
      
      <TableCell>
        <div className="flex gap-2">
          {/* Always enable search functionality for Make/Model */}
          <VehicleSearch
            defaultValue={vehicle.make}
            onSelectVehicle={(selected) => onSelectVehicle(index, selected)}
            onCreateNew={(makeModel) => onCreateNewVehicle(index, makeModel)}
          />
        </div>
      </TableCell>
      
      <TableCell>
        <div className="relative">
          <Input 
            type="number"
            value={vehicle.year || ''}
            onChange={e => onUpdate(index, 'year', parseInt(e.target.value) || undefined)}
            min={1900}
            max={new Date().getFullYear() + 1}
            className={`w-24 ${!canEditSensitiveFields ? 'opacity-70 bg-gray-100' : ''}`}
            disabled={!canEditSensitiveFields}
          />
          {!canEditSensitiveFields && !isSuperAdmin && (
            <div className="absolute right-2 top-2.5" aria-label="Only superadmins can edit this field">
              <Lock className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="relative">
          <Input 
            type="number"
            step="0.01"
            min="0.1"
            max="1.5"
            value={vehicle.latAcc}
            onChange={e => onUpdate(index, 'latAcc', parseFloat(e.target.value) || 0.8)}
            className={`w-24 ${!canEditSensitiveFields ? 'opacity-70 bg-gray-100' : ''}`}
            disabled={!canEditSensitiveFields}
          />
          {!canEditSensitiveFields && !isSuperAdmin && (
            <div className="absolute right-2 top-2.5" aria-label="Only superadmins can edit this field">
              <Lock className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex gap-2 justify-end">
          {/* Remove button */}
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            aria-label="Remove vehicle"
          >
            <Trash className="h-4 w-4" />
          </Button>
          
          {/* Save to DB button - only for vehicles that have been created new but not saved yet */}
          {isNewVehicle && !isSavedToDb && vehicle.make && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSaveToDatabase(index)}
              className="text-xs"
              aria-label="Save to database"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          )}
          
          {/* Edit button - only for superadmins and saved vehicles */}
          {isSavedToDb && isSuperAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toast.info("Super admin vehicle editing will be implemented in a future update");
              }}
              aria-label="Edit vehicle"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
