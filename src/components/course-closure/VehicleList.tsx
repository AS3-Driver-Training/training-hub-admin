
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CourseVehicle } from "@/types/programs";
import { PlusCircle, Trash2 } from "lucide-react";

interface VehicleListProps {
  vehicles: CourseVehicle[];
  onChange: (vehicles: CourseVehicle[]) => void;
}

export function VehicleList({ vehicles, onChange }: VehicleListProps) {
  const handleUpdateVehicle = (index: number, field: keyof CourseVehicle, value: any) => {
    const updatedVehicles = [...vehicles];
    
    if (field === 'car' || field === 'latAcc') {
      // Handle numeric fields
      const numValue = parseFloat(value);
      updatedVehicles[index] = {
        ...updatedVehicles[index],
        [field]: isNaN(numValue) ? 0 : numValue
      };
    } else {
      // Handle string fields
      updatedVehicles[index] = {
        ...updatedVehicles[index],
        [field]: value
      };
    }
    
    onChange(updatedVehicles);
  };

  const addVehicle = () => {
    const nextCarNumber = Math.max(...vehicles.map(v => v.car), 0) + 1;
    onChange([
      ...vehicles,
      {
        car: nextCarNumber,
        make: "",
        model: "",
        latAcc: 0.8
      }
    ]);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length === 1) return; // Prevent removing all vehicles
    const updatedVehicles = [...vehicles];
    updatedVehicles.splice(index, 1);
    onChange(updatedVehicles);
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vehicles</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={addVehicle}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>
      
      {vehicles.map((vehicle, index) => (
        <div key={index} className="grid gap-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Vehicle {index + 1}</h4>
            {vehicles.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeVehicle(index)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`car-${index}`}>Car #</Label>
              <Input
                id={`car-${index}`}
                type="number"
                value={vehicle.car}
                onChange={(e) => handleUpdateVehicle(index, 'car', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor={`make-${index}`}>Make</Label>
              <Input
                id={`make-${index}`}
                value={vehicle.make}
                onChange={(e) => handleUpdateVehicle(index, 'make', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor={`model-${index}`}>Model</Label>
              <Input
                id={`model-${index}`}
                value={vehicle.model || ''}
                onChange={(e) => handleUpdateVehicle(index, 'model', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor={`latacc-${index}`}>LatAcc</Label>
              <Input
                id={`latacc-${index}`}
                type="number"
                step="0.01"
                value={vehicle.latAcc}
                onChange={(e) => handleUpdateVehicle(index, 'latAcc', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
