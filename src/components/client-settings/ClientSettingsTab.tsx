
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Palette, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoUpload } from "./branding/LogoUpload";
import { ColorPicker } from "./branding/ColorPicker";
import { ProfileForm } from "./profile/ProfileForm";
import { BrandingPreview } from "./branding/BrandingPreview";

export function ClientSettingsTab() {
  const { clientId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleColorChange = async (color: string, field: 'primaryColor' | 'secondaryColor') => {
    setFormData(prev => ({ ...prev, [field]: color }));
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          [field === 'primaryColor' ? 'primary_color' : 'secondary_color']: color
        })
        .eq('id', clientId);

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success(`${field === 'primaryColor' ? 'Primary' : 'Secondary'} color updated`);
    } catch (error: any) {
      console.error('Failed to update color:', error);
      toast.error('Failed to save color change');
    }
  };

  const handleLogoUploadSuccess = async (logoUrl: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ logo_url: logoUrl })
        .eq('id', clientId);

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Logo updated successfully');
    } catch (error: any) {
      console.error('Failed to update logo URL:', error);
      toast.error('Failed to save logo URL');
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
