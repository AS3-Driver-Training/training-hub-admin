
import React, { useState, useEffect } from "react";
import { CourseClosureData, CourseVehicle, Vehicle } from "@/types/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Plus, Search, Lock } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

interface VehiclesStepProps {
  formData: Partial<CourseClosureData>;
  onUpdate: (data: Partial<CourseClosureData>) => void;
}

// Helper function to map database vehicle to frontend vehicle model
const mapDbVehicleToModel = (dbVehicle: any): Vehicle => {
  return {
    id: dbVehicle.id,
    make: dbVehicle.make,
    model: dbVehicle.model,
    year: dbVehicle.year,
    latAcc: dbVehicle.latacc || 0.8 // Map latacc to latAcc with a default value
  };
};

export function VehiclesStep({ formData, onUpdate }: VehiclesStepProps) {
  // Get user role to determine permissions
  const { userRole } = useProfile();
  const isSuperAdmin = userRole === "superadmin";
  
  // Track which vehicles are newly added vs selected from existing
  const [vehicleStatus, setVehicleStatus] = useState<Record<number, {isNew: boolean, dbId?: number}>>({});
  
  // Initialize vehicles array with existing data or empty array
  const [vehicles, setVehicles] = useState<CourseVehicle[]>(
    formData.vehicles && formData.vehicles.length > 0 ? formData.vehicles : []
  );
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState<number | null>(null);

  // Update parent form data when vehicles change
  useEffect(() => {
    onUpdate({
      vehicles
    });
  }, [vehicles, onUpdate]);

  // Search for vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .or(`make.ilike.%${debouncedSearchTerm}%,model.ilike.%${debouncedSearchTerm}%`)
          .limit(10);
          
        if (error) throw error;
        
        // Map database vehicles to frontend model
        const mappedVehicles = data?.map(mapDbVehicleToModel) || [];
        setSearchResults(mappedVehicles);
      } catch (error) {
        console.error("Error searching vehicles:", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchVehicles();
  }, [debouncedSearchTerm]);

  // Handle updating a vehicle field with role-based permissions
  const handleUpdateVehicle = (index: number, field: keyof CourseVehicle, value: any) => {
    // Check permissions for editing year and latAcc fields
    if ((field === 'year' || field === 'latAcc') && 
        !isSuperAdmin && 
        vehicleStatus[index] && 
        !vehicleStatus[index].isNew) {
      toast.error("Only super admins can modify year and lateral acceleration for existing vehicles");
      return;
    }

    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    setVehicles(updatedVehicles);
  };

  // Add a new empty vehicle entry
  const handleAddVehicle = () => {
    // Create a new vehicle with the next sequential car number
    const newCarNumber = vehicles.length > 0 ? vehicles.length + 1 : 1;
    
    const newVehicle: CourseVehicle = {
      car: newCarNumber,
      make: "",
      year: new Date().getFullYear(),
      latAcc: 0.8
    };
    
    setVehicles([...vehicles, newVehicle]);
    
    // Mark this vehicle as new (user created)
    setVehicleStatus({
      ...vehicleStatus,
      [vehicles.length]: { isNew: true }
    });
  };

  // Remove a vehicle from the list
  const handleRemoveVehicle = (index: number) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles.splice(index, 1);
    
    // Renumber cars sequentially
    updatedVehicles.forEach((v, i) => {
      v.car = i + 1;
    });
    
    setVehicles(updatedVehicles);
    
    // Update the vehicle status tracking
    const updatedStatus = { ...vehicleStatus };
    delete updatedStatus[index];
    
    // Shift status indices for vehicles after the deleted one
    Object.keys(updatedStatus).forEach(key => {
      const numKey = parseInt(key);
      if (numKey > index) {
        updatedStatus[numKey - 1] = updatedStatus[numKey];
        delete updatedStatus[numKey];
      }
    });
    
    setVehicleStatus(updatedStatus);
  };

  // Select an existing vehicle from search results
  const selectVehicle = async (vehicle: Vehicle, index?: number) => {
    if (index !== undefined) {
      // Update existing vehicle
      const updatedVehicles = [...vehicles];
      updatedVehicles[index] = { 
        ...updatedVehicles[index], 
        make: `${vehicle.make} ${vehicle.model || ''}`.trim(), 
        year: vehicle.year,
        latAcc: vehicle.latAcc || 0.8
      };
      setVehicles(updatedVehicles);
      
      // Update status to indicate this is an existing DB vehicle
      setVehicleStatus({
        ...vehicleStatus,
        [index]: { isNew: false, dbId: vehicle.id }
      });
      
      setActiveVehicleIndex(null);
    } else {
      // This case isn't used in the new implementation
      // as we don't have a separate "new vehicle" form anymore
    }
  };

  // Create a new vehicle in the database
  const createNewVehicle = async (index: number) => {
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
        // Update status to indicate this is now a DB vehicle
        setVehicleStatus({
          ...vehicleStatus,
          [index]: { isNew: false, dbId: data.id }
        });
        
        toast.success("Vehicle created successfully");
      }
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      toast.error(`Failed to create vehicle: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Course Vehicles</h3>
          <InfoTooltip 
            text="Add all vehicles used during the course. You can search for existing vehicles or add new ones."
            side="top"
          />
        </div>
      </div>
      
      <div className="border rounded-md p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Add all vehicles used during this course program. Each vehicle requires a make/model and lateral acceleration value.
          {!isSuperAdmin && (
            <span className="block mt-2 text-amber-600">
              Note: Only super admins can modify Year and LatAcc values for existing vehicles.
            </span>
          )}
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Car #</TableHead>
              <TableHead>Make/Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>LatAcc</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle, i) => {
              const isExistingVehicle = vehicleStatus[i] && !vehicleStatus[i].isNew;
              const canEditSensitiveFields = isSuperAdmin || (vehicleStatus[i] && vehicleStatus[i].isNew);
              
              return (
                <TableRow key={i}>
                  <TableCell>
                    <div className="w-20 text-center py-2">
                      {vehicle.car}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Popover open={activeVehicleIndex === i} onOpenChange={(open) => {
                        if (open) setActiveVehicleIndex(i);
                        else setActiveVehicleIndex(null);
                      }}>
                        <PopoverTrigger asChild>
                          <div className="flex-1 relative">
                            <Input 
                              value={vehicle.make}
                              onChange={e => {
                                handleUpdateVehicle(i, 'make', e.target.value);
                                if (activeVehicleIndex === i) {
                                  setSearchTerm(e.target.value);
                                }
                              }}
                              placeholder="e.g. Ford Explorer"
                              className="pr-8"
                            />
                            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 z-50 bg-white" align="start" side="bottom" alignOffset={0} sideOffset={5}>
                          <Command>
                            <CommandInput 
                              placeholder="Search vehicles..." 
                              value={searchTerm}
                              onValueChange={setSearchTerm}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {isSearching ? "Searching..." : "No vehicles found"}
                              </CommandEmpty>
                              <CommandGroup>
                                {searchResults.map((result) => (
                                  <CommandItem
                                    key={result.id}
                                    onSelect={() => selectVehicle(result, i)}
                                    className="cursor-pointer"
                                  >
                                    <span>
                                      {result.make} {result.model || ''} ({result.year || 'Unknown'})
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <Input 
                        type="number"
                        value={vehicle.year || ''}
                        onChange={e => handleUpdateVehicle(i, 'year', parseInt(e.target.value) || undefined)}
                        min={1900}
                        max={new Date().getFullYear() + 1}
                        className={`w-24 ${!canEditSensitiveFields ? 'opacity-70 bg-gray-100' : ''}`}
                        disabled={!canEditSensitiveFields}
                      />
                      {!canEditSensitiveFields && (
                        <Lock className="absolute right-2 top-2.5 h-3 w-3 text-muted-foreground" />
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
                        onChange={e => handleUpdateVehicle(i, 'latAcc', parseFloat(e.target.value) || 0.8)}
                        className={`w-24 ${!canEditSensitiveFields ? 'opacity-70 bg-gray-100' : ''}`}
                        disabled={!canEditSensitiveFields}
                      />
                      {!canEditSensitiveFields && (
                        <Lock className="absolute right-2 top-2.5 h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVehicle(i)}
                        title="Remove vehicle"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      
                      {vehicleStatus[i]?.isNew && !vehicleStatus[i]?.dbId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => createNewVehicle(i)}
                          className="text-xs"
                        >
                          Save
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="mt-4">
          <Button 
            type="button" 
            onClick={handleAddVehicle}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>
    </div>
  );
}
