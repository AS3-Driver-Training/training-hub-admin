import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import AddUserDialog from "./AddUserDialog";
import { UsersTable } from "./UsersTable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserData } from "./types";

interface ClientUsersTabProps {
  clientId: string;
  clientName: string;
}

export function ClientUsersTab({ clientId, clientName }: ClientUsersTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch users data from Supabase
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching users for client:", clientId);
        
        // Get client users with profile data
        const { data, error: fetchError } = await supabase
          .from('client_users')
          .select(`
            id,
            user_id,
            client_id,
            role,
            status,
            created_at,
            updated_at,
            profiles:user_id (
              email,
              first_name,
              last_name
            )
          `)
          .eq('client_id', clientId);

        if (fetchError) {
          console.error("Error fetching users:", fetchError);
          setError(fetchError.message || "Failed to load users");
          setIsLoading(false);
          toast.error("Failed to load users");
          return;
        }

        // Transform data to match UserData interface
        const transformedUsers: UserData[] = (data || []).map(user => ({
          id: user.id,
          user_id: user.user_id,
          client_id: user.client_id,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email: user.profiles?.email || '',
          profiles: {
            first_name: user.profiles?.first_name || '',
            last_name: user.profiles?.last_name || '',
          },
          // Groups and teams will be populated by UsersTable component
          groups: [],
          teams: []
        }));
        
        setUsersData(transformedUsers);
        setIsLoading(false);
        console.log("Users fetched successfully:", transformedUsers);
        
      } catch (err: any) {
        console.error("Error in users fetch process:", err);
        setError(err.message || "Failed to load users");
        setIsLoading(false);
        toast.error("Failed to load users");
      }
    }
    
    fetchUsers();
  }, [clientId]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-destructive">{error}</p>
          <button 
            className="text-sm text-primary hover:underline" 
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage {clientName} users and their permissions
          </p>
        </div>
        <AddUserDialog clientId={clientId} clientName={clientName} groups={[]} />
      </div>
      
      <UsersTable 
        users={usersData} 
        clientId={clientId}
        isLoading={isLoading}
      />
    </Card>
  );
}
