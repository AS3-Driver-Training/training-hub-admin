
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { InternalUsersTab } from "@/components/settings/InternalUsersTab";
import { SystemSettingsTab } from "@/components/settings/SystemSettingsTab";
import { PlatformSettingsTab } from "@/components/settings/PlatformSettingsTab";

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
            <PlatformSettingsTab />
          </TabsContent>

          <TabsContent value="users">
            <InternalUsersTab />
          </TabsContent>

          {userRole === "superadmin" && (
            <TabsContent value="system">
              <SystemSettingsTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
