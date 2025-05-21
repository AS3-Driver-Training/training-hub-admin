
import React, { useState } from "react";
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

interface VehicleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onVehicleCreated: (vehicle: { id: number; make: string; model: string; year: number; latAcc: number }) => void;
  initialMakeModel?: string;
}

export function VehicleFormDialog({
  open,
  onClose,
  onVehicleCreated,
  initialMakeModel = ""
}: VehicleFormDialogProps) {
  // Split the initialMakeModel into make and model if provided
  const initialParts = initialMakeModel.split(" ");
  const initialMake = initialParts.length > 0 ? initialParts[0] : "";
  const initialModel = initialParts.length > 1 ? initialParts.slice(1).join(" ") : "";

  // Form state
  const [make, setMake] = useState(initialMake);
  const [model, setModel] = useState(initialModel);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [latAcc, setLatAcc] = useState<number>(0.8);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Create vehicle in database
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          make: make.trim(),
          model: model.trim(),
          year,
          latacc: latAcc
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Vehicle created successfully");
      
      // Pass the created vehicle back to the parent
      onVehicleCreated({
        id: data.id,
        make: data.make,
        model: data.model || "",
        year: data.year,
        latAcc: data.latacc
      });
      
      handleClose();
    } catch (error: any) {
      toast.error(`Error creating vehicle: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle to the system. Fields marked with * are required.
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
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  min={1900}
                  max={new Date().getFullYear() + 1}
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
                  value={latAcc}
                  onChange={(e) => setLatAcc(parseFloat(e.target.value) || 0.8)}
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
              {isSubmitting ? "Creating..." : "Create Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
