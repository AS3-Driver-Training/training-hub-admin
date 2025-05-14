
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportStudentsDialog({ open, onOpenChange }: ImportStudentsDialogProps) {
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [defaultTeamId, setDefaultTeamId] = useState<string>('');
  
  // Fetch teams for the dropdown
  const { data: teams = [] } = useQueryClient().getQueryState(['teams'])?.data as { data: any[] } || { data: [] };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleDownloadTemplate = () => {
    // Create CSV content - header row
    const csvContent = "First Name,Last Name,Email,Phone,Employee Number,Team ID\n";
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please upload a valid CSV file",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, we would process the CSV file
      // For now, we'll just simulate a successful import
      
      // Mock successful import
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Students imported successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error importing students:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to import students",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import students. 
            <Button variant="link" className="p-0 h-auto font-normal" onClick={handleDownloadTemplate}>
              Download template
            </Button>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">CSV File</Label>
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              File must be in CSV format with headers matching the template.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultTeam">Default Team (Optional)</Label>
            <Select value={defaultTeamId} onValueChange={setDefaultTeamId}>
              <SelectTrigger id="defaultTeam">
                <SelectValue placeholder="Select default team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No default team</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} - {team.groups?.clients?.name || 'Unknown Client'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Students without a specified team will be assigned to this team.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Importing..." : "Import Students"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
