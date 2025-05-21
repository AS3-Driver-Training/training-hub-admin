
import React, { useState, useEffect } from "react";
import { CourseVehicle, Vehicle } from "@/types/programs";
import { supabase } from "@/integrations/supabase/client";
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
        { car: 1, make: "", year: new Date().getFullYear(), latAcc: 0.8 },
        { car: 2, make: "", year: new Date().getFullYear(), latAcc: 0.8 },
        { car: 3, make: "", year: new Date().getFullYear(), latAcc: 0.8 }
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
      year: new Date().getFullYear(),
      latAcc: 0.8
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
    handleUpdateVehicle(index, 'latAcc', vehicle.latAcc || 0.8);
    
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

  // Create new vehicle from text input and auto-save to database
  const handleCreateNewVehicle = async (index: number, makeModel: string) => {
    if (!makeModel) {
      toast.error("Vehicle make/model is required");
      return;
    }

    // Update the vehicle make in the UI immediately
    handleUpdateVehicle(index, 'make', makeModel);
    
    // Try to extract make and model from the combined field
    let make = makeModel;
    let model = "";
    
    // Simple heuristic: first word is make, rest is model
    const parts = makeModel.split(" ");
    if (parts.length > 1) {
      make = parts[0];
      model = parts.slice(1).join(" ");
    }
    
    try {
      // Insert vehicle into the database automatically
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          make,
          model,
          year: vehicles[index].year,
          latacc: vehicles[index].latAcc
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Update status to indicate this is now selected
        setVehicleStatuses(prev => ({
          ...prev,
          [index]: {
            isNew: false,
            isSelected: true,
            dbId: data.id
          }
        }));
        
        toast.success(`Vehicle "${makeModel}" created`);
      }
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      toast.error(`Failed to create vehicle: ${error.message}`);
    }
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
    handleCreateNewVehicle,
    isVehicleNew,
    isVehicleSelected
  };
}
