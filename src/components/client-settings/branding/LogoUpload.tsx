
import { useState } from "react";
import { Upload, Info, Loader2, ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LogoUploadProps {
  clientId: string;
  currentLogo?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function LogoUpload({ clientId, currentLogo, onUploadSuccess }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tempLogo, setTempLogo] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) {
      toast.error('No file provided');
      return;
    }
    
    await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or SVG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    console.log('Starting file upload for:', file.name, 'type:', file.type);
    
    try {
      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(file);
      setTempLogo(previewUrl);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${clientId}/${fileName}`;

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-logos')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      onUploadSuccess(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Upload process failed:', error);
      toast.error(error.message || 'Failed to upload logo');
      setTempLogo(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Logo</Label>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Max file size: 2MB
        </div>
      </div>
      
      {/* Logo Preview */}
      {(tempLogo || currentLogo) && (
        <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
          <img 
            src={tempLogo || currentLogo || ''} 
            alt="Current logo" 
            className="h-24 w-auto object-contain"
          />
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 transition-colors",
          "flex flex-col items-center justify-center gap-4",
          isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-primary/5",
          isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && document.getElementById('logo-upload')?.click()}
      >
        {isUploading ? (
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        ) : (
          <Upload className="h-12 w-12 text-muted-foreground" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium">
            {isUploading ? 'Uploading...' : 'Drag and drop your logo here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports PNG, JPG, SVG
          </p>
        </div>
        <input
          id="logo-upload"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>
    </div>
  );
}
