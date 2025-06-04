
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProgramsList } from "@/components/programs/ProgramsList";
import { ClientProgramsList } from "@/components/programs/ClientProgramsList";
import { useProfile } from "@/hooks/useProfile";

export default function Programs() {
  const { profile, userRole } = useProfile();

  // Show AS3 programs for internal users (superadmin, admin, staff)
  const isInternalUser = ["superadmin", "admin", "staff"].includes(userRole);
  
  // Show client programs for client users or when impersonating
  const isClientUser = profile?.clientUsers && profile.clientUsers.length > 0;

  return (
    <DashboardLayout>
      {isInternalUser && !profile?.impersonation?.isImpersonating ? (
        <ProgramsList />
      ) : isClientUser ? (
        <ClientProgramsList />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No access to programs</p>
        </div>
      )}
    </DashboardLayout>
  );
}
