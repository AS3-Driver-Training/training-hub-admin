
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, Calendar, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InviteClientDialog } from "@/components/InviteClientDialog";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const stats = [
  {
    title: "Total Users",
    value: "156",
    icon: Users,
    color: "bg-primary",
  },
  {
    title: "Active Events",
    value: "12",
    icon: Calendar,
    color: "bg-secondary",
  },
  {
    title: "Completed Trainings",
    value: "1,234",
    icon: CheckCircle,
    color: "bg-tertiary",
  },
];

const Index = () => {
  const { userRole } = useProfile();
  const navigate = useNavigate();
  const isSuperAdmin = userRole === 'superadmin';
  
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      console.log('Starting clients fetch. User role:', userRole);
      
      // First check if we have an authenticated session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.error('No active session found');
        throw new Error('No active session');
      }

      console.log('Session found, user ID:', session.user.id);

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching clients:', error);
          toast.error('Failed to load clients');
          throw error;
        }
        
        console.log('Successfully fetched clients:', data);
        return data || [];
      } catch (error) {
        console.error('Query error:', error);
        throw error;
      }
    },
    enabled: Boolean(userRole), // Only run query when we have the user role
    retry: 1, // Only retry once on failure
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your training programs and clients from one place
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h2 className="text-3xl font-bold">{stat.value}</h2>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {isSuperAdmin && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Client Organizations</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your client organizations and invitations
                </p>
              </div>
              <InviteClientDialog />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-destructive">
                        Failed to load clients. Please try again later.
                      </TableCell>
                    </TableRow>
                  ) : clients?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No clients found. Invite your first client to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients?.map((client) => (
                      <TableRow 
                        key={client.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <TableCell className="font-medium">
                          {client.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              client.status === "pending"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(client.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
