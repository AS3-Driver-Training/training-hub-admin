
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
  isSavedToDb: boolean;
  isSelected: boolean; // Added to track if a vehicle has been selected from search
  dbId?: number;
}

export function useVehicleManager({ vehicles, onVehiclesChange }: VehicleManagerProps) {
  // Track status of each vehicle (new vs existing, saved to DB or not)
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
          isSavedToDb: false,
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
            isNew: true, // Default to new until selected or saved
            isSavedToDb: false,
            isSelected: false // Not selected until user searches and picks one
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
    
    // Set status as new and not saved to DB
    setVehicleStatuses(prev => ({
      ...prev,
      [updatedVehicles.length - 1]: {
        isNew: true,
        isSavedToDb: false,
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
    
    // Mark this vehicle as selected and from database
    setVehicleStatuses(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        isNew: false,
        isSavedToDb: true,
        isSelected: true, // Mark as selected
        dbId: vehicle.id
      }
    }));
  };

  // Save a newly created vehicle to the database
  const handleSaveToDatabase = async (index: number) => {
    const vehicle = vehicles[index];
    
    if (!vehicle.make) {
      toast.error("Vehicle make/model is required");
      return;
    }
    
    try {
      // Try to extract make and model from the combined field
      let make = vehicle.make;
      let model = "";
      
      // Simple heuristic: first word is make, rest is model
      const parts = vehicle.make.split(" ");
      if (parts.length > 1) {
        make = parts[0];
        model = parts.slice(1).join(" ");
      }
      
      // Insert vehicle into the database
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          make,
          model,
          year: vehicle.year,
          latacc: vehicle.latAcc
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Update status to indicate this is now saved to DB
        setVehicleStatuses(prev => ({
          ...prev,
          [index]: {
            isNew: false,
            isSavedToDb: true,
            isSelected: true, // Mark as selected since we now have a complete vehicle
            dbId: data.id
          }
        }));
        
        toast.success("Vehicle created and saved to database");
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

  // Check if a vehicle has been saved to the database
  const isVehicleSavedToDb = (index: number): boolean => {
    return vehicleStatuses[index]?.isSavedToDb || false;
  };

  // Check if a vehicle has been selected (either from search or created and saved)
  const isVehicleSelected = (index: number): boolean => {
    return vehicleStatuses[index]?.isSelected || false;
  };

  // Create new vehicle from text input
  const handleCreateNewVehicle = (index: number, makeModel: string) => {
    handleUpdateVehicle(index, 'make', makeModel);
    
    // Mark this as a new vehicle that hasn't been saved yet
    setVehicleStatuses(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        isNew: true,
        isSavedToDb: false,
        isSelected: false // Not fully selected until saved
      }
    }));
  };

  return {
    handleAddVehicle,
    handleRemoveVehicle,
    handleUpdateVehicle,
    handleSelectVehicle,
    handleCreateNewVehicle,
    handleSaveToDatabase,
    isVehicleNew,
    isVehicleSavedToDb,
    isVehicleSelected
  };
}
