
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/types/programs";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { VehicleFormDialog } from "./VehicleFormDialog";

interface VehicleSearchProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onTriggerCreate: (makeModel: string) => void;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

// Helper function to map database vehicle to frontend vehicle model
const mapDbVehicleToModel = (dbVehicle: any): Vehicle => {
  return {
    id: dbVehicle.id,
    make: dbVehicle.make || '',
    model: dbVehicle.model || '',
    year: dbVehicle.year || new Date().getFullYear(),
    latAcc: dbVehicle.latacc || 0.8
  };
};

export function VehicleSearch({
  onSelectVehicle,
  onTriggerCreate,
  defaultValue = "",
  placeholder = "Search vehicles...",
  disabled = false
}: VehicleSearchProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Search for vehicles when the search term changes
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

  const handleSelectVehicle = (vehicle: Vehicle) => {
    onSelectVehicle(vehicle);
    setIsOpen(false);
    setSearchTerm(`${vehicle.make} ${vehicle.model}`.trim());
  };

  const handleCreateNew = () => {
    if (searchTerm.trim()) {
      setShowCreateDialog(true);
    }
  };

  const handleVehicleCreated = (newVehicle: Vehicle) => {
    onSelectVehicle(newVehicle);
    setSearchTerm(`${newVehicle.make} ${newVehicle.model}`.trim());
  };

  return (
    <>
      <Popover open={isOpen && !disabled} onOpenChange={(open) => !disabled && setIsOpen(open)}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isOpen && e.target.value && !disabled) setIsOpen(true);
              }}
              onClick={() => !disabled && setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pr-8"
              disabled={disabled}
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command>
            <CommandInput 
              placeholder="Search vehicles..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
              autoFocus
            />
            <CommandList>
              {isSearching && (
                <div className="py-2 px-3 text-xs text-muted-foreground">
                  Searching...
                </div>
              )}
              
              {!isSearching && searchResults.length === 0 && (
                <CommandEmpty className="py-2">
                  <div className="px-1 text-sm text-muted-foreground">
                    No vehicles found.
                  </div>
                  {searchTerm.trim().length > 0 && (
                    <div 
                      onClick={handleCreateNew}
                      className="flex items-center px-1 py-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                    >
                      <span className="text-blue-500 mr-1">+</span>
                      Create "{searchTerm}" as new vehicle
                    </div>
                  )}
                </CommandEmpty>
              )}
              
              <CommandGroup>
                {searchResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={`${result.make} ${result.model}`.trim()}
                    onSelect={() => handleSelectVehicle(result)}
                    className="cursor-pointer"
                  >
                    <span>
                      {result.make} {result.model || ''} 
                      <span className="ml-1 text-muted-foreground">({result.year || 'Unknown'})</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Vehicle Creation Dialog */}
      <VehicleFormDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onVehicleCreated={handleVehicleCreated}
        initialMakeModel={searchTerm}
      />
    </>
  );
}
