
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
import { toast } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportStudentsDialog({ open, onOpenChange }: ImportStudentsDialogProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleDownloadTemplate = () => {
    // Create a CSV template string with headers
    const headers = ["First Name", "Last Name", "Email", "Phone", "Employee Number", "Team", "Group"];
    const csvContent = headers.join(",") + "\n" + 
      "John,Doe,john.doe@example.com,123-456-7890,EMP123,Team A,Group 1\n" +
      "Jane,Smith,jane.smith@example.com,987-654-3210,EMP456,Team B,Group 2";
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to download the file
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a CSV file to upload");
      return;
    }
    
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Here we would implement the actual CSV processing logic
      // For now, we'll just simulate a successful upload with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Students imported successfully");
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error importing students:", error);
      toast.error(error.message || "Failed to import students");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with student data. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <Button variant="outline" type="button" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          
          <div className="border border-dashed border-gray-300 rounded-md p-6 w-full text-center">
            <input
              type="file"
              accept=".csv"
              id="csv-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {file ? file.name : "Click to upload CSV"}
              </span>
              <span className="text-xs text-muted-foreground">
                {file ? `${(file.size / 1024).toFixed(2)} KB` : "CSV files only"}
              </span>
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading ? "Importing..." : "Import Students"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
