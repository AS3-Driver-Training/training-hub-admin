
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProgramsList } from "@/components/programs/ProgramsList";
import { ClientProgramsList } from "@/components/programs/ClientProgramsList";
import { AS3ProgramsForClients } from "@/components/programs/AS3ProgramsForClients";
import { useProfile } from "@/hooks/useProfile";

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

  // For client users - show unified layout without tabs
  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Programs</h1>
        
        {/* AS3 Training Programs Section */}
        <AS3ProgramsForClients />
        
        {/* Client Programs Section */}
        <ClientProgramsList />
      </div>
    </DashboardLayout>
  );
}
