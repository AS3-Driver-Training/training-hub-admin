
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/types/programs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface VehicleSearchProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onCreateNew: (makeModel: string) => void;
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
  onCreateNew,
  defaultValue = "",
  placeholder = "Search or type to create new",
  disabled = false
}: VehicleSearchProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSelect = (value: string) => {
    const selected = searchResults.find(v => `${v.make} ${v.model}`.trim() === value);
    if (selected) {
      onSelectVehicle(selected);
      setIsOpen(false);
      setSearchTerm(`${selected.make} ${selected.model}`.trim());
    } else {
      // Create new vehicle if no match
      handleCreateNew();
    }
  };

  const handleCreateNew = () => {
    if (searchTerm.trim()) {
      onCreateNew(searchTerm);
      setIsOpen(false);
    }
  };

  // Always focus the search field when opening the popover
  const handleOpenChange = (open: boolean) => {
    if (open && !disabled) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="flex-1 relative">
          <Input 
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              if (!isOpen && !disabled) setIsOpen(true);
            }}
            onClick={() => !disabled && setIsOpen(true)}
            placeholder={placeholder}
            className="pr-8"
          />
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start" side="bottom" sideOffset={5}>
        <Command>
          <CommandInput 
            placeholder="Search vehicles..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            autoFocus
          />
          <CommandList>
            {isSearching && (
              <div className="py-2 px-4 text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            
            <CommandEmpty>
              <div className="py-2 px-4">
                <p className="text-sm text-muted-foreground">No vehicles found.</p>
                {searchTerm.trim().length > 0 && (
                  <Button 
                    onClick={handleCreateNew}
                    variant="ghost"
                    className="mt-2 w-full justify-start text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <span className="mr-2">+</span> 
                    Create "{searchTerm}" as new vehicle
                  </Button>
                )}
              </div>
            </CommandEmpty>
            
            <CommandGroup>
              {searchResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={`${result.make} ${result.model}`.trim()}
                  onSelect={handleSelect}
                  className="cursor-pointer flex justify-between"
                >
                  <div className="flex-1">
                    <span className="font-medium">
                      {result.make} {result.model || ''}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      ({result.year || 'Unknown'})
                    </span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    LatAcc: {result.latAcc || 0.8}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
