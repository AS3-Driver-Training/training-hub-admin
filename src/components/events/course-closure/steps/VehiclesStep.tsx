
import React, { useState, useEffect } from "react";
import { CourseClosureData, CourseVehicle, Vehicle } from "@/types/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Plus, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface VehiclesStepProps {
  formData: Partial<CourseClosureData>;
  onUpdate: (data: Partial<CourseClosureData>) => void;
}

const DEFAULT_VEHICLES: CourseVehicle[] = [
  { car: 1, make: "", year: 0, latAcc: 0.8 },
  { car: 2, make: "", year: 0, latAcc: 0.8 },
  { car: 3, make: "", year: 0, latAcc: 0.8 },
];

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
  // Initialize with 3 empty vehicles or existing data
  const [vehicles, setVehicles] = useState<CourseVehicle[]>(
    formData.vehicles && formData.vehicles.length > 0 
      ? formData.vehicles 
      : DEFAULT_VEHICLES
  );
  
  const [newVehicle, setNewVehicle] = useState<CourseVehicle>({
    car: 1,
    make: "",
    year: new Date().getFullYear(),
    latAcc: 0.8,
  });
  
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

  const handleUpdateVehicle = (index: number, field: keyof CourseVehicle, value: any) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    setVehicles(updatedVehicles);
  };

  const handleAddVehicle = () => {
    if (!newVehicle.make) return;

    // Find next available car number
    const maxCarNumber = Math.max(...vehicles.map(v => v.car), 0);
    
    setVehicles([...vehicles, { 
      ...newVehicle,
      car: maxCarNumber + 1
    }]);
    
    // Reset new vehicle form
    setNewVehicle({
      car: maxCarNumber + 2,
      make: "",
      year: new Date().getFullYear(),
      latAcc: 0.8
    });
  };

  const handleRemoveVehicle = (index: number) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles.splice(index, 1);
    
    // Renumber cars if needed
    if (updatedVehicles.length > 0) {
      updatedVehicles.forEach((v, i) => {
        v.car = i + 1;
      });
    }
    
    setVehicles(updatedVehicles);
  };

  const selectVehicle = (vehicle: Vehicle, index?: number) => {
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
      setActiveVehicleIndex(null);
    } else {
      // Set as new vehicle
      setNewVehicle({
        ...newVehicle,
        make: `${vehicle.make} ${vehicle.model || ''}`.trim(),
        year: vehicle.year,
        latAcc: vehicle.latAcc || 0.8
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Course Vehicles</h3>
      
      <div className="border rounded-md p-4">
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
            {vehicles.map((vehicle, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Input 
                    type="number" 
                    value={vehicle.car}
                    onChange={e => handleUpdateVehicle(i, 'car', parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-20"
                  />
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
                      <PopoverContent className="p-0" align="start" side="bottom" alignOffset={0} sideOffset={5}>
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
                  <Input 
                    type="number"
                    value={vehicle.year || ''}
                    onChange={e => handleUpdateVehicle(i, 'year', parseInt(e.target.value) || undefined)}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1.5"
                    value={vehicle.latAcc}
                    onChange={e => handleUpdateVehicle(i, 'latAcc', parseFloat(e.target.value) || 0.8)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVehicle(i)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="border rounded-md p-4 space-y-4">
        <h4 className="text-sm font-medium">Add Vehicle</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="car-number">Car Number</Label>
            <Input 
              id="car-number"
              type="number"
              value={newVehicle.car}
              onChange={e => setNewVehicle({...newVehicle, car: parseInt(e.target.value) || 1})}
              min="1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="make">Make/Model</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex-1 relative">
                    <Input 
                      id="make"
                      value={newVehicle.make}
                      onChange={e => {
                        setNewVehicle({...newVehicle, make: e.target.value});
                        setSearchTerm(e.target.value);
                      }}
                      placeholder="e.g. Ford Explorer"
                      className="pr-8"
                    />
                    <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
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
                            onSelect={() => selectVehicle(result)}
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
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input 
              id="year"
              type="number"
              value={newVehicle.year || ''}
              onChange={e => setNewVehicle({...newVehicle, year: parseInt(e.target.value) || undefined})}
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div>
            <Label htmlFor="latacc">LatAcc</Label>
            <Input 
              id="latacc"
              type="number"
              step="0.01"
              min="0.1"
              max="1.5"
              value={newVehicle.latAcc}
              onChange={e => setNewVehicle({...newVehicle, latAcc: parseFloat(e.target.value) || 0.8})}
            />
          </div>
        </div>
        <Button 
          type="button" 
          onClick={handleAddVehicle} 
          disabled={!newVehicle.make}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>
    </div>
  );
}
