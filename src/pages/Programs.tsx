
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProgramsList } from "@/components/programs/ProgramsList";
import { ClientProgramsList } from "@/components/programs/ClientProgramsList";
import { AS3ProgramsForClients } from "@/components/programs/AS3ProgramsForClients";
import { useProfile } from "@/hooks/useProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Programs() {
  const { profile, userRole, isLoading } = useProfile();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Show AS3 programs for internal users when not impersonating
  const isInternalUser = ["superadmin", "admin", "staff"].includes(userRole);
  const showInternalAS3Programs = isInternalUser && !profile?.impersonation?.isImpersonating;
  
  // Show client programs for client users or when impersonating
  const isClientUser = profile?.clientUsers && profile.clientUsers.length > 0;
  const showClientPrograms = isClientUser || profile?.impersonation?.isImpersonating;
  
  // Show AS3 programs for clients (read-only with enrollment options)
  const showAS3ProgramsForClients = showClientPrograms;

  // If neither internal nor client user, show no access
  if (!showInternalAS3Programs && !showClientPrograms) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No access to programs</p>
        </div>
      </DashboardLayout>
    );
  }

  // For internal users (full access)
  if (showInternalAS3Programs) {
    return (
      <DashboardLayout>
        <ProgramsList />
      </DashboardLayout>
    );
  }

  // For client users - show both AS3 programs (read-only) and their client programs
  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Programs</h1>
        
        <Tabs defaultValue="as3-programs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="as3-programs">AS3 Training Programs</TabsTrigger>
            <TabsTrigger value="client-programs">My Organization Programs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="as3-programs" className="mt-6">
            <AS3ProgramsForClients />
          </TabsContent>
          
          <TabsContent value="client-programs" className="mt-6">
            <ClientProgramsList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
