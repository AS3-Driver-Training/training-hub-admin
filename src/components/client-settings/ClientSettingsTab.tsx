
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Palette, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HexColorPicker } from "react-colorful";

interface BrandingPreviewProps {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}

function BrandingPreview({ logoUrl, primaryColor, secondaryColor }: BrandingPreviewProps) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h4 className="font-semibold text-sm text-muted-foreground">Branding Preview</h4>
      <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: secondaryColor + '20' }}>
        {logoUrl ? (
          <img src={logoUrl} alt="Client logo" className="h-12 w-auto object-contain" />
        ) : (
          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="space-y-2">
          <div className="h-4 w-24 rounded" style={{ backgroundColor: primaryColor }} />
          <div className="h-3 w-32 rounded" style={{ backgroundColor: secondaryColor }} />
        </div>
      </div>
    </div>
  );
}

export function ClientSettingsTab() {
  const { clientId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tempLogo, setTempLogo] = useState<string | null>(null);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      console.log('Fetching client details for:', clientId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      console.log('Fetched client:', data);
      return data;
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    contactEmail: '',
    primaryColor: '#9b87f5',
    secondaryColor: '#8E9196',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zip_code || '',
        phone: client.phone || '',
        contactEmail: client.contact_email || '',
        primaryColor: client.primary_color || '#9b87f5',
        secondaryColor: client.secondary_color || '#8E9196',
      });
    }
  }, [client]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleColorChange = async (color: string, field: 'primaryColor' | 'secondaryColor') => {
    setFormData(prev => ({ ...prev, [field]: color }));
    
    // Immediately update the database with the new color
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          [field === 'primaryColor' ? 'primary_color' : 'secondary_color']: color
        })
        .eq('id', clientId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    } catch (error: any) {
      console.error('Failed to update color:', error);
      toast.error('Failed to save color change');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    await handleFileUpload(file);
  };

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
    if (!clientId) {
      toast.error('Client ID not found');
      return;
    }

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
      const filePath = `${clientId}/logo.${fileExt}`;
      console.log('Uploading to path:', filePath);

      // First upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client-assets')
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
        .from('client-assets')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      // Update client record with new logo URL
      const { error: updateError } = await supabase
        .from('clients')
        .update({ logo_url: publicUrl })
        .eq('id', clientId);

      if (updateError) {
        console.error('Client update error:', updateError);
        throw updateError;
      }

      console.log('Client updated with new logo URL');

      // Refresh client data
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Logo uploaded and updated successfully');
    } catch (error: any) {
      console.error('Upload process failed:', error);
      toast.error(error.message || 'Failed to upload logo');
      setTempLogo(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          phone: formData.phone,
          contact_email: formData.contactEmail,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
        })
        .eq('id', clientId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Client settings updated successfully');
    } catch (error: any) {
      console.error('Failed to update client:', error);
      toast.error(error.message || 'Failed to update client settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-background border-b rounded-none p-0 h-auto">
          <div className="flex space-x-4 px-4">
            <TabsTrigger 
              value="profile" 
              className={cn(
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-3"
              )}
            >
              Profile Information
            </TabsTrigger>
            <TabsTrigger 
              value="branding"
              className={cn(
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-3"
              )}
            >
              Branding
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Enter organization name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    placeholder="Enter city"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={handleInputChange('state')}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange('zipCode')}
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange('contactEmail')}
                  placeholder="Enter contact email"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="p-6">
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Logo</Label>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Max file size: 2MB
                  </div>
                </div>
                
                {/* Logo Preview */}
                {(tempLogo || client?.logo_url) && (
                  <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                    <img 
                      src={tempLogo || client?.logo_url} 
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

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2 items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-10 h-10 rounded border shadow-sm"
                          style={{ backgroundColor: formData.primaryColor }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                          color={formData.primaryColor}
                          onChange={(color) => handleColorChange(color, 'primaryColor')}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value, 'primaryColor')}
                      placeholder="#000000"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2 items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-10 h-10 rounded border shadow-sm"
                          style={{ backgroundColor: formData.secondaryColor }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                          color={formData.secondaryColor}
                          onChange={(color) => handleColorChange(color, 'secondaryColor')}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      id="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={(e) => handleColorChange(e.target.value, 'secondaryColor')}
                      placeholder="#000000"
                      className="font-mono"
                    />
                  </div>
                </div>

                <BrandingPreview
                  logoUrl={tempLogo || client?.logo_url}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Palette className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

