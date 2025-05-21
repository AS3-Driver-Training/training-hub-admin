
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Vehicle } from "@/types/programs";

interface VehicleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onVehicleCreated: (vehicle: { id: number; make: string; model: string; year: number; latAcc: number }) => void;
  initialMake?: string;
  initialModel?: string;
  initialYear?: number;
  initialLatAcc?: number;
  vehicleId?: number;
  mode: 'create' | 'edit';
}

export function VehicleFormDialog({
  open,
  onClose,
  onVehicleCreated,
  initialMake = "",
  initialModel = "",
  initialYear,
  initialLatAcc,
  vehicleId,
  mode = 'create'
}: VehicleFormDialogProps) {
  // Form state
  const [make, setMake] = useState(initialMake);
  const [model, setModel] = useState(initialModel);
  const [year, setYear] = useState<number | undefined>(initialYear || new Date().getFullYear());
  const [latAcc, setLatAcc] = useState<number | undefined>(initialLatAcc || 0.8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state when props change (important for edit mode)
  useEffect(() => {
    if (open) {
      setMake(initialMake);
      setModel(initialModel);
      setYear(initialYear || new Date().getFullYear());
      setLatAcc(initialLatAcc || 0.8);
    }
  }, [open, initialMake, initialModel, initialYear, initialLatAcc]);

  // Form validation
  const isFormValid = make.trim().length > 0;

  // Reset form on close
  const handleClose = () => {
    setIsSubmitting(false);
    onClose();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    
    try {
      let data;
      let error;
      
      if (mode === 'edit' && vehicleId) {
        // Update existing vehicle
        const response = await supabase
          .from("vehicles")
          .update({
            make: make.trim(),
            model: model.trim(),
            year,
            latacc: latAcc
          })
          .eq("id", vehicleId)
          .select()
          .single();
          
        data = response.data;
        error = response.error;
        
        if (error) throw error;
        
        toast.success("Vehicle updated successfully");
      } else {
        // Create new vehicle
        const response = await supabase
          .from("vehicles")
          .insert({
            make: make.trim(),
            model: model.trim(),
            year,
            latacc: latAcc
          })
          .select()
          .single();
          
        data = response.data;
        error = response.error;
        
        if (error) throw error;
        
        toast.success("Vehicle created successfully");
      }
      
      // Pass the created/updated vehicle back to the parent
      onVehicleCreated({
        id: data.id,
        make: data.make,
        model: data.model || "",
        year: data.year,
        latAcc: data.latacc
      });
      
      handleClose();
    } catch (error: any) {
      toast.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} vehicle: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'edit' ? 'Edit Vehicle' : 'Create New Vehicle'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'edit' 
                ? 'Update vehicle information in the system.' 
                : 'Add a new vehicle to the system.'} 
              Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Ford"
                autoFocus
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Explorer"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={year || ''}
                  onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : undefined)}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  placeholder="e.g. 2023"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="latAcc">Lateral Acceleration</Label>
                <Input
                  id="latAcc"
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1.5"
                  value={latAcc || ''}
                  onChange={(e) => setLatAcc(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g. 0.8"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 
                (mode === 'edit' ? "Updating..." : "Creating...") : 
                (mode === 'edit' ? "Update Vehicle" : "Create Vehicle")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
