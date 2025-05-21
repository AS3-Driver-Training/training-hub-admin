
import React, { useState, useEffect } from "react";
import { CourseVehicle, Vehicle } from "@/types/programs";
import { toast } from "sonner";

interface VehicleManagerProps {
  vehicles: CourseVehicle[];
  onVehiclesChange: (updatedVehicles: CourseVehicle[]) => void;
}

interface VehicleStatus {
  isNew: boolean;
  isSelected: boolean;
  dbId?: number;
}

export function useVehicleManager({ vehicles, onVehiclesChange }: VehicleManagerProps) {
  // Track status of each vehicle (new vs selected)
  const [vehicleStatuses, setVehicleStatuses] = useState<Record<number, VehicleStatus>>({});

  // Initialize with 3 empty vehicles if none exist
  useEffect(() => {
    if (vehicles.length === 0) {
      // Create 3 empty vehicle rows
      const initialVehicles: CourseVehicle[] = [
        { car: 1, make: "", year: undefined, latAcc: undefined },
        { car: 2, make: "", year: undefined, latAcc: undefined },
        { car: 3, make: "", year: undefined, latAcc: undefined }
      ];
      
      onVehiclesChange(initialVehicles);
      
      // Set initial statuses for all 3 vehicles
      const initialStatuses: Record<number, VehicleStatus> = {};
      initialVehicles.forEach((_, index) => {
        initialStatuses[index] = {
          isNew: true,
          isSelected: false
        };
      });
      
      setVehicleStatuses(initialStatuses);
    }
  }, []);

  // Initialize vehicle statuses on component load or when vehicles change
  useEffect(() => {
    if (vehicles.length > 0) {
      const initialStatuses: Record<number, VehicleStatus> = { ...vehicleStatuses };
      
      vehicles.forEach((vehicle, index) => {
        // If we don't have a status for this vehicle yet, initialize it
        if (!initialStatuses[index]) {
          initialStatuses[index] = {
            isNew: true,
            isSelected: false
          };
        }
      });
      
      setVehicleStatuses(initialStatuses);
    }
  }, [vehicles.length]);

  // Add a new vehicle to the list
  const handleAddVehicle = () => {
    // Get next sequential car number
    const newCarNumber = vehicles.length > 0 ? vehicles.length + 1 : 1;
    
    // Create a new empty vehicle
    const newVehicle: CourseVehicle = {
      car: newCarNumber,
      make: "",
      year: undefined,
      latAcc: undefined
    };
    
    // Add to vehicles array
    const updatedVehicles = [...vehicles, newVehicle];
    onVehiclesChange(updatedVehicles);
    
    // Set status as new and not selected
    setVehicleStatuses(prev => ({
      ...prev,
      [updatedVehicles.length - 1]: {
        isNew: true,
        isSelected: false
      }
    }));
  };

  // Remove a vehicle from the list
  const handleRemoveVehicle = (index: number) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles.splice(index, 1);
    
    // Renumber vehicles sequentially
    updatedVehicles.forEach((v, i) => {
      v.car = i + 1;
    });
    
    onVehiclesChange(updatedVehicles);
    
    // Update vehicle statuses
    const updatedStatuses = { ...vehicleStatuses };
    delete updatedStatuses[index];
    
    // Shift indices for vehicles after the removed one
    Object.keys(updatedStatuses).forEach(key => {
      const numKey = parseInt(key);
      if (numKey > index) {
        updatedStatuses[numKey - 1] = updatedStatuses[numKey];
        delete updatedStatuses[numKey];
      }
    });
    
    setVehicleStatuses(updatedStatuses);
  };

  // Update a vehicle field
  const handleUpdateVehicle = (index: number, field: keyof CourseVehicle, value: any) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    onVehiclesChange(updatedVehicles);
  };

  // Handle selecting a vehicle from search
  const handleSelectVehicle = (index: number, vehicle: Vehicle) => {
    // Update the vehicle data
    handleUpdateVehicle(index, 'make', `${vehicle.make} ${vehicle.model || ''}`.trim());
    handleUpdateVehicle(index, 'year', vehicle.year);
    handleUpdateVehicle(index, 'latAcc', vehicle.latAcc);
    
    // Mark this vehicle as selected
    setVehicleStatuses(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        isNew: false,
        isSelected: true,
        dbId: vehicle.id
      }
    }));
    
    toast.success(`Selected ${vehicle.make} ${vehicle.model || ''}`);
  };

  // Trigger to open vehicle creation dialog
  const handleTriggerCreateVehicle = (index: number, makeModel: string) => {
    // This now just prepares the UI for vehicle creation
    // The actual creation happens in the VehicleFormDialog
    console.log(`Triggering vehicle creation for index ${index} with makeModel: ${makeModel}`);
    // The state update is now handled by the VehiclesStep component
  };

  // Check if a vehicle is new (created by user vs selected from DB)
  const isVehicleNew = (index: number): boolean => {
    return vehicleStatuses[index]?.isNew || false;
  };

  // Check if a vehicle has been selected (either from search or created)
  const isVehicleSelected = (index: number): boolean => {
    return vehicleStatuses[index]?.isSelected || false;
  };

  return {
    handleAddVehicle,
    handleRemoveVehicle,
    handleUpdateVehicle,
    handleSelectVehicle,
    handleTriggerCreateVehicle,
    isVehicleNew,
    isVehicleSelected
  };
}
