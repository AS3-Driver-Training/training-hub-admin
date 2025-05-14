
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AddUserDialog } from "./AddUserDialog";
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
        
        // In a real app, this would be a real Supabase query
        // For now we'll simulate an API call
        setTimeout(() => {
          // Provide the hardcoded data
          setUsersData(createSampleUsers(clientId));
          setIsLoading(false);
        }, 1000);
        
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to load users");
        setIsLoading(false);
        toast.error("Failed to load users");
      }
    }
    
    fetchUsers();
  }, [clientId]);

  // Function to create sample users with different statuses
  function createSampleUsers(clientId: string): UserData[] {
    const marketingGroup = {
      id: "marketing-group-id",
      name: "Marketing",
      description: "Marketing department",
      is_default: false,
      client_id: clientId,
      teams: [
        {
          id: "social-team-id",
          name: "Social Media",
          group_id: "marketing-group-id"
        },
        {
          id: "content-team-id",
          name: "Content",
          group_id: "marketing-group-id"
        }
      ]
    };

    const salesGroup = {
      id: "sales-group-id",
      name: "Sales",
      description: "Sales department",
      is_default: true,
      client_id: clientId,
      teams: [
        {
          id: "direct-sales-team-id",
          name: "Direct Sales",
          group_id: "sales-group-id"
        },
        {
          id: "partners-team-id",
          name: "Partners",
          group_id: "sales-group-id"
        }
      ]
    };

    const socialTeam = {
      id: "social-team-id",
      name: "Social Media",
      group_id: "marketing-group-id",
      group: {
        id: "marketing-group-id",
        name: "Marketing",
        description: "Marketing department",
        is_default: false
      }
    };

    const contentTeam = {
      id: "content-team-id",
      name: "Content",
      group_id: "marketing-group-id",
      group: {
        id: "marketing-group-id",
        name: "Marketing",
        description: "Marketing department",
        is_default: false
      }
    };

    const directSalesTeam = {
      id: "direct-sales-team-id",
      name: "Direct Sales",
      group_id: "sales-group-id",
      group: {
        id: "sales-group-id",
        name: "Sales",
        description: "Sales department",
        is_default: true
      }
    };

    // Return array of users with different statuses
    return [
      {
        id: "active-admin-id",
        user_id: "user-uuid-1",
        client_id: clientId,
        role: "client_admin",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "john.doe@example.com",
        profiles: {
          first_name: "John",
          last_name: "Doe"
        },
        groups: [marketingGroup, salesGroup],
        teams: [socialTeam, directSalesTeam]
      },
      {
        id: "pending-manager-id",
        user_id: "user-uuid-2",
        client_id: clientId,
        role: "manager",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "jane.smith@example.com",
        profiles: {
          first_name: "Jane",
          last_name: "Smith"
        },
        groups: [marketingGroup],
        teams: [contentTeam]
      },
      {
        id: "inactive-supervisor-id",
        user_id: "user-uuid-3",
        client_id: clientId,
        role: "supervisor",
        status: "inactive",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "robert.johnson@example.com",
        profiles: {
          first_name: "Robert",
          last_name: "Johnson"
        },
        groups: [],
        teams: []
      },
      {
        id: "suspended-manager-id",
        user_id: "user-uuid-4",
        client_id: clientId,
        role: "manager",
        status: "suspended",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "sarah.williams@example.com",
        profiles: {
          first_name: "Sarah",
          last_name: "Williams"
        },
        groups: [salesGroup],
        teams: [directSalesTeam]
      },
      {
        id: "invited-supervisor-id",
        user_id: "user-uuid-5",
        client_id: clientId,
        role: "supervisor",
        status: "invited",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "michael.brown@example.com",
        profiles: {
          first_name: "Michael",
          last_name: "Brown"
        },
        groups: [],
        teams: []
      }
    ];
  }

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
        <AddUserDialog clientId={clientId} />
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <UsersTable 
          users={usersData} 
          clientId={clientId}
        />
      )}
    </Card>
  );
}
