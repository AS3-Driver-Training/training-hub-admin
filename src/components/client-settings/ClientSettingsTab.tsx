import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Palette, Loader2, CheckCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoUpload } from "./branding/LogoUpload";
import { ColorPicker } from "./branding/ColorPicker";
import { ProfileForm } from "./profile/ProfileForm";
import { BrandingPreview } from "./branding/BrandingPreview";

export function ClientSettingsTab() {
  const { clientId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("branding");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      const originalData = {
        name: client.name || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zip_code || '',
        phone: client.phone || '',
        contactEmail: client.contact_email || '',
        primaryColor: client.primary_color || '#9b87f5',
        secondaryColor: client.secondary_color || '#8E9196',
      };

      const hasChanges = Object.keys(formData).some(key => {
        return formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData];
      });

      setHasChanges(hasChanges);
    }
  }, [formData, client]);

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

  const handleProfileChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (color: string, field: 'primaryColor' | 'secondaryColor') => {
    console.log('Color changed:', field, color); // Debug log
    setFormData(prev => ({ ...prev, [field]: color }));
  };

  const handleLogoUploadSuccess = async (logoUrl: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ logo_url: logoUrl })
        .eq('id', clientId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Logo updated successfully', {
        description: 'Your logo has been saved',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error: any) {
      toast.error('Failed to save logo', {
        description: error.message,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !hasChanges) return;
    
    setIsSubmitting(true);
    try {
      console.log('Submitting colors:', formData.primaryColor, formData.secondaryColor);
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
          secondary_color: formData.secondaryColor
        })
        .eq('id', clientId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Changes saved successfully', {
        description: 'Your settings have been updated',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        duration: 3000, // Show for 3 seconds
      });
    } catch (error: any) {
      toast.error('Failed to save changes', {
        description: error.message,
      });
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
            <ProfileForm 
              data={formData}
              onChange={handleProfileChange}
            />
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="p-6">
            <div className="grid gap-6">
              <LogoUpload
                clientId={clientId || ''}
                currentLogo={client?.logo_url}
                onUploadSuccess={handleLogoUploadSuccess}
              />

              <div className="grid gap-4">
                <ColorPicker
                  label="Primary Color"
                  color={formData.primaryColor}
                  onChange={(color) => handleColorChange(color, 'primaryColor')}
                />

                <ColorPicker
                  label="Secondary Color"
                  color={formData.secondaryColor}
                  onChange={(color) => handleColorChange(color, 'secondaryColor')}
                />

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

      <div className="flex justify-end gap-2 items-center">
        {!hasChanges && !isSubmitting && (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            All changes saved
          </span>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : hasChanges ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              No Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
