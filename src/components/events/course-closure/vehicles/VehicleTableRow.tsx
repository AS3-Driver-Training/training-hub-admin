
import React from "react";
import { CourseVehicle, Vehicle } from "@/types/programs";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";
import { VehicleSearch } from "./VehicleSearch";
import { useProfile } from "@/hooks/useProfile";

interface VehicleTableRowProps {
  vehicle: CourseVehicle;
  index: number;
  isNewVehicle: boolean;
  isSelected: boolean;
  onUpdate: (index: number, field: keyof CourseVehicle, value: any) => void;
  onRemove: (index: number) => void;
  onSelectVehicle: (index: number, vehicle: Vehicle) => void;
  onTriggerCreateVehicle: (index: number, makeModel: string) => void;
  onEditVehicle: (index: number) => void;
}

export function VehicleTableRow({
  vehicle,
  index,
  isNewVehicle,
  isSelected,
  onUpdate,
  onRemove,
  onSelectVehicle,
  onTriggerCreateVehicle,
  onEditVehicle
}: VehicleTableRowProps) {
  const { userRole } = useProfile();
  const isSuperAdmin = userRole === "superadmin";
  
  return (
    <TableRow>
      <TableCell>
        <div className="w-20 text-center py-2">{vehicle.car}</div>
      </TableCell>
      
      <TableCell>
        <VehicleSearch
          defaultValue={vehicle.make}
          placeholder="Search for make/model..."
          onSelectVehicle={(selected) => onSelectVehicle(index, selected)}
          onTriggerCreate={(makeModel) => onTriggerCreateVehicle(index, makeModel)}
          disabled={isSelected} // Disable search if a vehicle is already selected
        />
      </TableCell>
      
      <TableCell>
        <div className="text-sm px-3 py-2">
          {vehicle.year || '—'}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm px-3 py-2">
          {vehicle.latAcc || '—'}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex justify-end gap-2">
          {isSuperAdmin && isSelected && (
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => onEditVehicle(index)}
              aria-label="Edit vehicle"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            aria-label="Remove vehicle"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
