import { DashboardLayout } from "@/components/DashboardLayout";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InviteClientDialog } from "@/components/InviteClientDialog";
import { CountryFilter } from "@/components/clients/CountryFilter";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { getCountryByCode, formatLastActivity } from "@/utils/countries";
import { Search, AlertTriangle } from "lucide-react";

interface ClientWithMetrics {
  id: string;
  name: string;
  status: string;
  country: string;
  contact_email: string | null;
  last_activity_at: string | null;
  created_at: string;
  active_users_count: number;
  upcoming_courses_count: number;
}

export default function Clients() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients-enhanced'],
    queryFn: async () => {
      try {
        console.log('Fetching enhanced clients data...');
        const { data, error } = await supabase
          .from('clients')
          .select(`
            id,
            name,
            status,
            country,
            contact_email,
            last_activity_at,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching clients:', error);
          toast.error('Failed to load clients');
          throw error;
        }

        // Get additional metrics for each client
        const clientsWithMetrics = await Promise.all(
          (data || []).map(async (client) => {
            // Get active users count
            const { count: activeUsersCount } = await supabase
              .from('client_users')
              .select('*', { count: 'exact', head: true })
              .eq('client_id', client.id)
              .eq('status', 'active');

            // Get upcoming courses count (courses starting in the future)
            const { count: upcomingCoursesCount } = await supabase
              .from('course_instances')
              .select('*', { count: 'exact', head: true })
              .eq('host_client_id', client.id)
              .gte('start_date', new Date().toISOString());

            return {
              ...client,
              active_users_count: activeUsersCount || 0,
              upcoming_courses_count: upcomingCoursesCount || 0,
            };
          })
        );

        console.log('Enhanced clients data:', clientsWithMetrics);
        return clientsWithMetrics;
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    },
  });

  // Filter clients based on search and country
  const filteredClients = clients?.filter((client: ClientWithMetrics) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === "all" || client.country === countryFilter;
    return matchesSearch && matchesCountry;
  }) || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatMemberSince = (createdAt: string) => {
    return new Date(createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-destructive">
          Error loading clients. Please try again later.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client organizations and track their engagement
            </p>
          </div>
          <InviteClientDialog />
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <CountryFilter value={countryFilter} onValueChange={setCountryFilter} />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Details</TableHead>
                <TableHead>Status & Activity</TableHead>
                <TableHead>Metrics</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    {searchQuery || countryFilter !== "all" 
                      ? "No clients match your filters." 
                      : "No clients found. Invite your first client to get started."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => {
                  const country = getCountryByCode(client.country);
                  return (
                    <TableRow 
                      key={client.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}/settings`)}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{client.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {country.flag}
                            </Badge>
                          </div>
                          {client.contact_email && (
                            <div className="text-sm text-muted-foreground">
                              {client.contact_email}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Member since {formatMemberSince(client.created_at)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant={getStatusVariant(client.status)}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </Badge>
                          <div className="text-sm">
                            <div className="text-muted-foreground">
                              Last activity: {formatLastActivity(client.last_activity_at)}
                            </div>
                            {client.active_users_count > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {client.active_users_count} active users
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{client.active_users_count}</span>
                            <span className="text-muted-foreground"> active users</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{client.upcoming_courses_count}</span>
                            <span className="text-muted-foreground">upcoming courses</span>
                            {client.upcoming_courses_count === 0 && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/clients/${client.id}/settings`);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
