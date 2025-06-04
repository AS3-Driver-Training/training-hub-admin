
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProgramsList } from "@/components/programs/ProgramsList";
import { ClientProgramsList } from "@/components/programs/ClientProgramsList";
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
  const showAS3Programs = isInternalUser && !profile?.impersonation?.isImpersonating;
  
  // Show client programs for client users or when impersonating
  const isClientUser = profile?.clientUsers && profile.clientUsers.length > 0;
  const showClientPrograms = isClientUser || profile?.impersonation?.isImpersonating;

  return (
    <DashboardLayout>
      {showAS3Programs ? (
        <ProgramsList />
      ) : showClientPrograms ? (
        <ClientProgramsList />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No access to programs</p>
        </div>
      )}
    </DashboardLayout>
  );
}
