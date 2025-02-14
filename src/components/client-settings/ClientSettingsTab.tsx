import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Palette, Info } from "lucide-react";
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

const colorOptions = [
  // Purple variants
  '#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C', '#D6BCFA',
  // Soft pastels
  '#F2FCE2', '#FEF7CD', '#FEC6A1', '#E5DEFF', '#FFDEE2',
  // Vibrant colors
  '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#403E43',
  // Cool grays
  '#8E9196', '#75869600', '#aaadb0', '#3336', '#222'
];

export function ClientSettingsTab() {
  const { clientId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    name: client?.name || '',
    address: client?.address || '',
    city: client?.city || '',
    state: client?.state || '',
    zipCode: client?.zip_code || '',
    phone: client?.phone || '',
    contactEmail: client?.contact_email || '',
    primaryColor: client?.primary_color || '#9b87f5',
    secondaryColor: client?.secondary_color || '#8E9196',
  });

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${clientId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('client-assets')
        .getPublicUrl(filePath);

      // Update client with new logo URL
      const { error: updateError } = await supabase
        .from('clients')
        .update({ logo_url: publicUrl })
        .eq('id', clientId);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Logo updated successfully');
    } catch (error: any) {
      toast.error('Failed to upload logo: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or SVG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Create an image object to check dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      // Validate dimensions (min 200x200, max 1000x1000)
      if (img.width < 200 || img.height < 200) {
        toast.error('Image dimensions must be at least 200x200 pixels');
        return;
      }
      if (img.width > 1000 || img.height > 1000) {
        toast.error('Image dimensions must not exceed 1000x1000 pixels');
        return;
      }

      setIsUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${clientId}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('client-assets')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('client-assets')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('clients')
          .update({ logo_url: publicUrl })
          .eq('id', clientId);

        if (updateError) throw updateError;

        queryClient.invalidateQueries({ queryKey: ['client', clientId] });
        toast.success('Logo updated successfully');
      } catch (error: any) {
        toast.error('Failed to upload logo: ' + error.message);
      } finally {
        setIsUploading(false);
      }
    };

    img.onerror = () => {
      toast.error('Invalid image file');
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Client settings updated successfully');
    } catch (error: any) {
      toast.error('Failed to update client settings: ' + error.message);
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
                    Recommended: 200x200px to 1000x1000px (max 2MB)
                  </div>
                </div>
                
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 transition-colors",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "flex flex-col items-center justify-center gap-4 cursor-pointer"
                  )}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  {client?.logo_url ? (
                    <img 
                      src={client.logo_url} 
                      alt="Current logo" 
                      className="h-24 w-auto object-contain"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isUploading ? 'Uploading...' : 'Drag and drop your logo here or click to browse'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports PNG, JPG, SVG (max 2MB)
                    </p>
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
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
                          onChange={(color) => setFormData(prev => ({ ...prev, primaryColor: color }))}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleInputChange('primaryColor')}
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
                          onChange={(color) => setFormData(prev => ({ ...prev, secondaryColor: color }))}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      id="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleInputChange('secondaryColor')}
                      placeholder="#000000"
                      className="font-mono"
                    />
                  </div>
                </div>

                <BrandingPreview
                  logoUrl={client?.logo_url}
                  primaryColor={formData.primaryColor}
                  secondaryColor={formData.secondaryColor}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit">
          <Palette className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
