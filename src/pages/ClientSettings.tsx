import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ClientUsersTab } from "@/components/client-settings/ClientUsersTab";
import { ClientInvitationsTab } from "@/components/client-settings/ClientInvitationsTab";
import { ClientSettingsTab } from "@/components/client-settings/ClientSettingsTab";

export default function ClientSettings() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">
              Manage client settings, users, and invitations
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <ClientUsersTab clientId={clientId!} />
          </TabsContent>

          <TabsContent value="invitations">
            <ClientInvitationsTab clientId={clientId!} clientName={client.name} />
          </TabsContent>

          <TabsContent value="settings">
            <ClientSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}