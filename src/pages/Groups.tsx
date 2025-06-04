import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientGroupsTab } from "@/components/client-settings/ClientGroupsTab";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";

export default function Groups() {
  const { impersonation } = useProfile();

  // Get the client ID - either from impersonation or user's actual client
  const { data: clientData, isLoading, error } = useQuery({
    queryKey: ['user_client_data_groups'],
    queryFn: async () => {
      try {
        // If impersonating, use the impersonated client ID
        if (impersonation.isImpersonating && impersonation.impersonatedClientId) {
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', impersonation.impersonatedClientId)
            .single();

          if (clientError) throw clientError;
          
          return {
            clientId: impersonation.impersonatedClientId,
            clientName: client.name
          };
        }

        // Otherwise, get the user's actual client
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data: clientUser, error: clientUserError } = await supabase
          .from('client_users')
          .select(`
            client_id,
            clients:client_id (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (clientUserError) throw clientUserError;
        if (!clientUser.clients) throw new Error('Client not found');

        return {
          clientId: clientUser.client_id,
          clientName: clientUser.clients.name
        };
      } catch (error: any) {
        console.error('Error fetching client data:', error);
        toast.error('Error loading organization data');
        throw error;
      }
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !clientData) {
    return (
      <DashboardLayout>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center h-32 gap-4">
            <div className="text-destructive">
              {error ? 'Error loading organization data' : 'Organization not found'}
            </div>
            <p className="text-muted-foreground text-sm">
              You may not have access to an organization or there may be a configuration issue.
            </p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Groups & Teams</h1>
          <p className="text-muted-foreground">
            Manage {clientData.clientName} groups and teams
          </p>
        </div>

        <ClientGroupsTab clientId={clientData.clientId} />
      </div>
    </DashboardLayout>
  );
}
