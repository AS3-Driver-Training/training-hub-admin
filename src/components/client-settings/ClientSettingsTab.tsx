
import { useParams } from "react-router-dom";
import { useState } from "react";
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

  const [primaryColor, setPrimaryColor] = useState(client?.primary_color || '#9b87f5');
  const [secondaryColor, setSecondaryColor] = useState(client?.secondary_color || '#8E9196');
  
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
      toast.error('Failed to save logo');
    }
  };

  const updateColors = async () => {
    if (!clientId) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          primary_color: primaryColor,
          secondary_color: secondaryColor
        })
        .eq('id', clientId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Colors saved successfully', {
        description: 'Your brand colors have been updated',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error: any) {
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

  const hasColorChanges = 
    primaryColor !== client?.primary_color || 
    secondaryColor !== client?.secondary_color;

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
                name: client?.name || '',
                address: client?.address || '',
                city: client?.city || '',
                state: client?.state || '',
                zipCode: client?.zip_code || '',
                phone: client?.phone || '',
                contactEmail: client?.contact_email || '',
              }}
              onChange={() => {}}
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
                  color={primaryColor}
                  onChange={setPrimaryColor}
                />

                <ColorPicker
                  label="Secondary Color"
                  color={secondaryColor}
                  onChange={setSecondaryColor}
                />

                <BrandingPreview
                  logoUrl={client?.logo_url}
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
