
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
  dbId?: number;
}

export function useVehicleManager({ vehicles, onVehiclesChange }: VehicleManagerProps) {
  // Track status of each vehicle (new vs existing, saved to DB or not)
  const [vehicleStatuses, setVehicleStatuses] = useState<Record<number, VehicleStatus>>({});

  // Initialize vehicle statuses on component load
  useEffect(() => {
    const initialStatuses: Record<number, VehicleStatus> = {};
    
    vehicles.forEach((vehicle, index) => {
      // If we have a vehicle with a known make/model but no isNew flag,
      // we assume it's an existing vehicle from a previous session
      initialStatuses[index] = {
        isNew: false,
        isSavedToDb: true, // Assume existing vehicles are already in DB
        dbId: undefined
      };
    });
    
    setVehicleStatuses(initialStatuses);
  }, []);

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
        isSavedToDb: false
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
            isNew: false, // No longer considered "new" once saved
            isSavedToDb: true,
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

  return {
    handleAddVehicle,
    handleRemoveVehicle,
    handleUpdateVehicle,
    handleSaveToDatabase,
    isVehicleNew,
    isVehicleSavedToDb
  };
}
