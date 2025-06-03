import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { ClientUsersTab } from "@/components/client-settings/ClientUsersTab";
import { ClientSettingsTab } from "@/components/client-settings/ClientSettingsTab";
import { ClientGroupsTab } from "@/components/client-settings/ClientGroupsTab";
import { ClientEventsTab } from "@/components/client-settings/ClientEventsTab";
import { ClientStudentsTab } from "@/components/client-settings/ClientStudentsTab";
import { toast } from "sonner";
import { ManualUserActivation } from "@/components/admin/ManualUserActivation";

export default function ClientSettings() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      try {
        console.log('Fetching client details for:', clientId);
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
      } catch (error: any) {
        console.error('Error in client query:', error);
        toast.error('Error loading client data');
        throw error;
      }
    },
    retry: 1,
  });

  const handleImpersonateClient = async () => {
    try {
      // Store current session info for later restoration
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('previousRole', 'staff');
        localStorage.setItem('previousUserId', session.user.id);
      }

      // Navigate to client dashboard with impersonation flag
      navigate(`/client/${clientId}/dashboard?impersonate=true`);
      toast.success('Switched to client view');
    } catch (error) {
      console.error('Error impersonating client:', error);
      toast.error('Failed to switch to client view');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <div className="text-destructive">
            {error ? 'Error loading client data' : 'Client not found'}
          </div>
          <Button variant="outline" onClick={() => navigate('/clients')}>
            Return to Clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/clients')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-left">{client.name}</h1>
              <p className="text-muted-foreground">
                Manage client settings, users, and groups
              </p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={handleImpersonateClient}
          >
            <UserCircle2 className="mr-2 h-4 w-4" />
            View as Client
          </Button>
        </div>

        {/* Add Manual User Activation for admins */}
        <ManualUserActivation />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="groups">Groups & Teams</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <ClientUsersTab clientId={clientId!} clientName={client.name} />
          </TabsContent>

          <TabsContent value="groups">
            <ClientGroupsTab clientId={clientId!} />
          </TabsContent>

          <TabsContent value="events">
            <ClientEventsTab clientId={clientId!} />
          </TabsContent>

          <TabsContent value="students">
            <ClientStudentsTab clientId={clientId!} />
          </TabsContent>

          <TabsContent value="settings">
            <ClientSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
