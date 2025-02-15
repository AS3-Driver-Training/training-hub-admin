
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Palette, Loader2, CheckCircle } from "lucide-react";
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
  const [primaryColor, setPrimaryColor] = useState('#9b87f5');
  const [secondaryColor, setSecondaryColor] = useState('#8E9196');
  
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      console.log('Fetching client with ID:', clientId);
      
      const { data: clientUser, error: clientUserError } = await supabase
        .from('client_users')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (clientUserError) {
        console.error('Error fetching client user:', clientUserError);
        throw clientUserError;
      }

      if (!clientUser) {
        throw new Error('Unauthorized access: You do not have permission to view this client');
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching client:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Client not found');
      }
      
      console.log('Fetched client:', data);
      return data;
    },
  });

  // Update color states when client data is loaded
  useEffect(() => {
    if (client) {
      console.log('Setting initial colors:', {
        primary: client.primary_color,
        secondary: client.secondary_color
      });
      setPrimaryColor(client.primary_color || '#9b87f5');
      setSecondaryColor(client.secondary_color || '#8E9196');
    }
  }, [client]);
  
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
      console.error('Error updating logo:', error);
      toast.error('Failed to save logo');
    }
  };

  const updateColors = async () => {
    if (!clientId) return;
    
    setIsSubmitting(true);
    try {
      console.log('Updating colors for client:', clientId, {
        primaryColor,
        secondaryColor,
        clientId
      });
      
      const { error } = await supabase
        .from('clients')
        .update({
          primary_color: primaryColor,
          secondary_color: secondaryColor
        })
        .eq('id', clientId);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      // Force a refetch of the client data
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      
      toast.success('Colors saved successfully', {
        description: 'Your brand colors have been updated',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error: any) {
      console.error('Error updating colors:', error);
      toast.error('Failed to save colors', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  const hasColorChanges = 
    primaryColor !== client.primary_color || 
    secondaryColor !== client.secondary_color;

  return (
    <div className="space-y-6">
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
              data={{
                name: client.name || '',
                address: client.address || '',
                city: client.city || '',
                state: client.state || '',
                zipCode: client.zip_code || '',
                phone: client.phone || '',
                contactEmail: client.contact_email || '',
              }}
              onChange={() => {}}
            />
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="p-6">
            <div className="grid gap-6">
              <LogoUpload
                clientId={clientId}
                currentLogo={client.logo_url}
                onUploadSuccess={handleLogoUploadSuccess}
              />

              <div className="grid gap-4">
                <ColorPicker
                  label="Primary Color"
                  color={primaryColor}
                  onChange={setPrimaryColor}
                />

                <ColorPicker
                  label="Secondary Color"
                  color={secondaryColor}
                  onChange={setSecondaryColor}
                />

                <BrandingPreview
                  logoUrl={client.logo_url}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={updateColors}
          disabled={isSubmitting || !hasColorChanges}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Palette className="h-4 w-4 mr-2" />
              {hasColorChanges ? 'Save Colors' : 'No Changes'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
