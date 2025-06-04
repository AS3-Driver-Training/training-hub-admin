
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProgramsList } from "@/components/programs/ProgramsList";
import { ClientProgramsList } from "@/components/programs/ClientProgramsList";
import { AS3ProgramsForClients } from "@/components/programs/AS3ProgramsForClients";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";

export default function Programs() {
  const { profile, userRole, isLoading } = useProfile();

  console.log('Programs page state:', { 
    isLoading, 
    userRole, 
    isImpersonating: profile?.impersonation?.isImpersonating,
    impersonatedClientId: profile?.impersonation?.impersonatedClientId,
    originalRole: profile?.impersonation?.originalRole
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Check if we're in impersonation mode
  const isImpersonating = profile?.impersonation?.isImpersonating || false;
  const isInternalUser = ["superadmin", "admin", "staff"].includes(userRole);
  const isClientUser = profile?.clientUsers && profile.clientUsers.length > 0;

  console.log('Programs access logic:', {
    isImpersonating,
    isInternalUser, 
    isClientUser,
    finalDecision: isImpersonating ? 'client-view' : (isInternalUser ? 'internal-view' : 'client-view')
  });

  // PRIORITY 1: If impersonating, always show client view regardless of original role
  if (isImpersonating) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold">Programs</h1>
          
          <Tabs defaultValue="as3-programs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="as3-programs">AS3 Programs</TabsTrigger>
              <TabsTrigger value="client-programs">Client Programs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="as3-programs" className="space-y-6">
              <AS3ProgramsForClients />
            </TabsContent>
            
            <TabsContent value="client-programs" className="space-y-6">
              <ClientProgramsList />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // PRIORITY 2: For internal users when not impersonating - show full internal view
  if (isInternalUser) {
    return (
      <DashboardLayout>
        <ProgramsList />
      </DashboardLayout>
    );
  }

  // PRIORITY 3: For client users when not impersonating - show client view
  if (isClientUser) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold">Programs</h1>
          
          <Tabs defaultValue="as3-programs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="as3-programs">AS3 Programs</TabsTrigger>
              <TabsTrigger value="client-programs">Client Programs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="as3-programs" className="space-y-6">
              <AS3ProgramsForClients />
            </TabsContent>
            
            <TabsContent value="client-programs" className="space-y-6">
              <ClientProgramsList />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback for users with no access
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No access to programs</p>
      </div>
    </DashboardLayout>
  );
}
