
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientUsersTab } from "@/components/client-settings/ClientUsersTab";
import { ClientSettingsTab } from "@/components/client-settings/ClientSettingsTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("settings");

  const { data: organization, isLoading, error } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('created_by', user.id)
        .maybeSingle(); // Changed from single() to maybeSingle()

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  if (!organization) {
    return (
      <DashboardLayout>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">No Organization Found</h2>
          <p className="text-muted-foreground">
            You are not currently associated with any organization. Please contact your administrator.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and users
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="settings">General</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <ClientSettingsTab />
          </TabsContent>

          <TabsContent value="users">
            <ClientUsersTab 
              clientId={organization.id} 
              clientName={organization.name} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
