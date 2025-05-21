
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/types/programs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";

interface VehicleSearchProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onCreateNew: (makeModel: string) => void;
  defaultValue?: string;
  placeholder?: string;
}

// Helper function to map database vehicle to frontend vehicle model
const mapDbVehicleToModel = (dbVehicle: any): Vehicle => {
  return {
    id: dbVehicle.id,
    make: dbVehicle.make || '',
    model: dbVehicle.model || '',
    year: dbVehicle.year || new Date().getFullYear(),
    latAcc: dbVehicle.latacc || 0.8 // Map latacc to latAcc with a default value
  };
};

export function VehicleSearch({
  onSelectVehicle,
  onCreateNew,
  defaultValue = "",
  placeholder = "e.g. Ford Explorer"
}: VehicleSearchProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSelect = (value: string) => {
    const selected = searchResults.find(v => `${v.make} ${v.model}`.trim() === value);
    if (selected) {
      onSelectVehicle(selected);
      setIsOpen(false);
      setSearchTerm(`${selected.make} ${selected.model}`.trim());
    } else {
      // Create new vehicle if no match
      onCreateNew(searchTerm);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex-1 relative">
          <Input 
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
            }}
            onClick={() => setIsOpen(true)}
            placeholder={placeholder}
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
              {isSearching ? (
                "Searching..."
              ) : (
                <div className="py-2 px-4">
                  <p className="text-sm">No vehicles found.</p>
                  <button 
                    onClick={() => handleSelect(searchTerm)} 
                    className="text-sm text-blue-500 hover:text-blue-700 mt-1"
                  >
                    Create "{searchTerm}" as new vehicle
                  </button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {searchResults.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(`${result.make} ${result.model}`.trim())}
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
  );
}
