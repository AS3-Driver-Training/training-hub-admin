
import React, { useState, useEffect } from "react";
import { CourseVehicle, Vehicle } from "@/types/programs";
import { toast } from "sonner";

interface VehicleManagerProps {
  vehicles: CourseVehicle[];
  onVehiclesChange: (updatedVehicles: CourseVehicle[]) => void;
}

interface VehicleStatus {
  isSelected: boolean;
  dbId?: number;
}

export function useVehicleManager({ vehicles, onVehiclesChange }: VehicleManagerProps) {
  // Track status of each vehicle (selected from DB or not)
  const [vehicleStatuses, setVehicleStatuses] = useState<Record<number, VehicleStatus>>({});

  // Initialize with 3 empty vehicles if none exist
  useEffect(() => {
    if (vehicles.length === 0) {
      // Create 3 empty vehicle rows
      const initialVehicles: CourseVehicle[] = [
        { car: 1, make: "", model: undefined, year: undefined, latAcc: undefined },
        { car: 2, make: "", model: undefined, year: undefined, latAcc: undefined },
        { car: 3, make: "", model: undefined, year: undefined, latAcc: undefined }
      ];
      
      onVehiclesChange(initialVehicles);
      
      // Set initial statuses for all 3 vehicles
      const initialStatuses: Record<number, VehicleStatus> = {};
      initialVehicles.forEach((_, index) => {
        initialStatuses[index] = {
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
            isSelected: Boolean(vehicle.year && vehicle.latAcc)
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
      model: undefined,
      year: undefined,
      latAcc: undefined
    };
    
    // Add to vehicles array
    const updatedVehicles = [...vehicles, newVehicle];
    onVehiclesChange(updatedVehicles);
    
    // Set status as not selected
    setVehicleStatuses(prev => ({
      ...prev,
      [updatedVehicles.length - 1]: {
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
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = {
      car: updatedVehicles[index].car,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      latAcc: vehicle.latAcc
    };
    onVehiclesChange(updatedVehicles);
    
    // Mark this vehicle as selected
    setVehicleStatuses(prev => ({
      ...prev,
      [index]: {
        isSelected: true,
        dbId: vehicle.id
      }
    }));
    
    toast.success(`Selected ${vehicle.make} ${vehicle.model || ''}`);
  };

  // Clear vehicle selection
  const handleClearVehicle = (index: number) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = {
      car: updatedVehicles[index].car,
      make: "",
      model: undefined,
      year: undefined,
      latAcc: undefined
    };
    onVehiclesChange(updatedVehicles);

    setVehicleStatuses(prev => ({
      ...prev,
      [index]: {
        isSelected: false,
        dbId: undefined
      }
    }));
  };

  // Check if a vehicle has been selected from DB
  const isVehicleSelected = (index: number): boolean => {
    return vehicleStatuses[index]?.isSelected || false;
  };

  // Get the database ID of a vehicle if selected from DB
  const getVehicleDbId = (index: number): number | undefined => {
    return vehicleStatuses[index]?.dbId;
  };

  return {
    handleAddVehicle,
    handleRemoveVehicle,
    handleUpdateVehicle,
    handleSelectVehicle,
    handleClearVehicle,
    isVehicleSelected,
    getVehicleDbId
  };
}
