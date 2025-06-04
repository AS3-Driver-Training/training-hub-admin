
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, Save } from "lucide-react";
import { ProfileForm } from "./profile/ProfileForm";
import { queryKeys } from "@/lib/queryKeys";

interface CompanyProfileTabProps {
  clientId: string;
}

export function CompanyProfileTab({ clientId }: CompanyProfileTabProps) {
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
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    contactEmail: '',
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
      });
    }
  }, [client]);

  const handleProfileChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !hasChanges) return;
    
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
        })
        .eq('id', clientId);

      if (error) throw error;

      // Invalidate all client-related queries to ensure consistency
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.client(clientId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.userClientData() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.userClientDataGroups() }),
      ]);

      toast.success('Company profile updated successfully', {
        description: 'Your company information has been saved',
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
        <ProfileForm 
          data={formData}
          onChange={handleProfileChange}
        />
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
