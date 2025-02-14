
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientUsersTab } from "@/components/client-settings/ClientUsersTab";
import { ClientSettingsTab } from "@/components/client-settings/ClientSettingsTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const { userRole } = useProfile();
  
  // Only internal users (superadmin, admin, staff) should access this page
  if (!["superadmin", "admin", "staff"].includes(userRole)) {
    return (
      <DashboardLayout>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have permission to access this page. This section is reserved for internal system users.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Manage internal system settings and staff users
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="settings">General</TabsTrigger>
            <TabsTrigger value="users">Internal Users</TabsTrigger>
            {userRole === "superadmin" && (
              <TabsTrigger value="system">System</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="settings">
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Platform Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure global platform settings and defaults
                </p>
              </div>
              {/* Add platform settings form here */}
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Internal Users</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage system administrators and staff accounts
                  </p>
                </div>
                {/* Add internal user management here */}
              </div>
            </Card>
          </TabsContent>

          {userRole === "superadmin" && (
            <TabsContent value="system">
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">System Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced system settings and configurations
                  </p>
                </div>
                {/* Add system configuration options here */}
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
