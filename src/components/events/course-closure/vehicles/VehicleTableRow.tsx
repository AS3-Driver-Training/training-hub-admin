
import React, { useState } from "react";
import { CourseVehicle, Vehicle } from "@/types/programs";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Edit, X } from "lucide-react";
import { VehicleSearch } from "./VehicleSearch";
import { useProfile } from "@/hooks/useProfile";
import { Input } from "@/components/ui/input";

interface VehicleTableRowProps {
  vehicle: CourseVehicle;
  index: number;
  isSelected: boolean;
  dbId?: number;
  onUpdate: (index: number, field: keyof CourseVehicle, value: any) => void;
  onRemove: (index: number) => void;
  onSelectVehicle: (index: number, vehicle: Vehicle) => void;
  onClearVehicle: (index: number) => void;
  onEditVehicle: (index: number) => void;
  onCreateVehicle: (index: number, make: string, model: string) => void;
}

export function VehicleTableRow({
  vehicle,
  index,
  isSelected,
  dbId,
  onUpdate,
  onRemove,
  onSelectVehicle,
  onClearVehicle,
  onEditVehicle,
  onCreateVehicle
}: VehicleTableRowProps) {
  const { userRole } = useProfile();
  const isSuperAdmin = userRole === "superadmin";
  
  // Track if we're currently editing the car number
  const [editingCarNumber, setEditingCarNumber] = useState(false);
  
  return (
    <TableRow>
      <TableCell>
        {editingCarNumber ? (
          <Input
            type="number"
            className="w-16 text-center py-1"
            value={vehicle.car}
            onChange={(e) => onUpdate(index, 'car', parseInt(e.target.value) || 1)}
            onBlur={() => setEditingCarNumber(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingCarNumber(false)}
            autoFocus
            min={1}
          />
        ) : (
          <div 
            className="w-16 text-center py-2 cursor-pointer hover:bg-gray-100 rounded"
            onClick={() => setEditingCarNumber(true)}
          >
            {vehicle.car}
          </div>
        )}
      </TableCell>
      
      <TableCell className="w-full">
        <div className="flex space-x-2 items-center">
          <VehicleSearch
            defaultValue={`${vehicle.make} ${vehicle.model || ''}`.trim()}
            placeholder="Search for make/model..."
            onSelectVehicle={(selected) => onSelectVehicle(index, selected)}
            onCreateVehicle={(make, model) => onCreateVehicle(index, make, model)}
          />
          
          {isSelected && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => onClearVehicle(index)}
              aria-label="Clear vehicle"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm px-3 py-2">
          {vehicle.year || '—'}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm px-3 py-2">
          {vehicle.latAcc ? vehicle.latAcc.toFixed(2) : '—'}
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
