
import React from "react";
import { CourseVehicle } from "@/types/programs";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Trash, Save, Check } from "lucide-react";
import { VehicleSearch } from "./VehicleSearch";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface VehicleTableRowProps {
  vehicle: CourseVehicle;
  index: number;
  isNewVehicle: boolean;
  isSavedToDb: boolean;
  onUpdate: (index: number, field: keyof CourseVehicle, value: any) => void;
  onRemove: (index: number) => void;
  onSaveToDatabase: (index: number) => void;
}

export function VehicleTableRow({
  vehicle,
  index,
  isNewVehicle,
  isSavedToDb,
  onUpdate,
  onRemove,
  onSaveToDatabase
}: VehicleTableRowProps) {
  const { userRole } = useProfile();
  const isSuperAdmin = userRole === "superadmin";

  // Determine which fields can be edited by the current user
  const canEditSensitiveFields = isSuperAdmin || (isNewVehicle && !isSavedToDb);

  return (
    <TableRow>
      <TableCell>
        <div className="w-20 text-center py-2">{vehicle.car}</div>
      </TableCell>
      
      <TableCell>
        <div className="flex gap-2">
          {isNewVehicle ? (
            <VehicleSearch
              defaultValue={vehicle.make}
              onSelectVehicle={(selected) => {
                onUpdate(index, 'make', `${selected.make} ${selected.model || ''}`.trim());
                onUpdate(index, 'year', selected.year);
                onUpdate(index, 'latAcc', selected.latAcc || 0.8);
              }}
              onCreateNew={(makeModel) => {
                onUpdate(index, 'make', makeModel);
              }}
            />
          ) : (
            <Input
              value={vehicle.make}
              onChange={e => onUpdate(index, 'make', e.target.value)}
              placeholder="e.g. Ford Explorer"
            />
          )}
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
          {!canEditSensitiveFields && (
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
          {!canEditSensitiveFields && (
            <div className="absolute right-2 top-2.5" aria-label="Only superadmins can edit this field">
              <Lock className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            aria-label="Remove vehicle"
          >
            <Trash className="h-4 w-4" />
          </Button>
          
          {isNewVehicle && !isSavedToDb && (
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
          
          {isSavedToDb && (
            <span className="text-green-600 flex items-center text-xs">
              <Check className="h-3 w-3 mr-1" />
              Saved
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
