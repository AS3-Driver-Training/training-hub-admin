
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, Save } from "lucide-react";
import { LogoUpload } from "./branding/LogoUpload";
import { ColorPicker } from "./branding/ColorPicker";
import { BrandingPreview } from "./branding/BrandingPreview";
import { queryKeys } from "@/lib/queryKeys";

interface BrandingTabProps {
  clientId: string;
}

export function BrandingTab({ clientId }: BrandingTabProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: queryKeys.client(clientId),
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
    primaryColor: '#9b87f5',
    secondaryColor: '#8E9196',
  });

  useEffect(() => {
    if (client) {
      const originalData = {
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
        primaryColor: client.primary_color || '#9b87f5',
        secondaryColor: client.secondary_color || '#8E9196',
      });
    }
  }, [client]);

  const handleColorChange = (color: string, field: 'primaryColor' | 'secondaryColor') => {
    console.log('Color changed:', field, color);
    setFormData(prev => ({ ...prev, [field]: color }));
  };

  const handleLogoUploadSuccess = async (logoUrl: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ logo_url: logoUrl })
        .eq('id', clientId);

      if (error) throw error;

      // Invalidate all client-related queries to ensure consistency
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.client(clientId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.userClientData() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.userClientDataGroups() }),
      ]);

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
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor
        })
        .eq('id', clientId);

      if (error) throw error;

      // Invalidate all client-related queries to ensure consistency
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.client(clientId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.userClientData() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.userClientDataGroups() }),
      ]);

      toast.success('Branding updated successfully', {
        description: 'Your branding settings have been saved',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        duration: 3000,
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
      <Card className="p-6">
        <div className="grid gap-6">
          <LogoUpload
            clientId={clientId}
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
