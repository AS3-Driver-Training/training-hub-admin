
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { CreateClientProgramDialog } from "./CreateClientProgramDialog";
import { ClientProgram } from "@/types/client-programs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Eye, Edit } from "lucide-react";
import { format } from "date-fns";

export function ClientProgramsList() {
  const { profile } = useProfile();

  const { data: programs, isLoading } = useQuery({
    queryKey: ["client-programs", profile?.clientUsers?.[0]?.client_id],
    queryFn: async () => {
      if (!profile?.clientUsers?.[0]?.client_id) return [];

      const { data, error } = await supabase
        .from("client_programs")
        .select("*")
        .eq("client_id", profile.clientUsers[0].client_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ClientProgram[];
    },
    enabled: !!profile?.clientUsers?.[0]?.client_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Programs</h2>
          <CreateClientProgramDialog />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getLocationText = (program: ClientProgram) => {
    if (program.location_type === "virtual") {
      return program.location_name || "Virtual";
    }
    if (program.location_type === "hybrid") {
      return `Hybrid: ${program.location_name || program.location_address || "Multiple"}`;
    }
    return program.location_name || program.location_address || "TBD";
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case "virtual":
        return "bg-blue-100 text-blue-800";
      case "hybrid":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getEnrollmentTypeText = (type: string) => {
    switch (type) {
      case "open":
        return "Open Enrollment";
      case "invitation":
        return "Invitation Only";
      case "team_specific":
        return "Team Specific";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Programs</h2>
          <p className="text-muted-foreground">
            Create and manage custom training programs for your organization
          </p>
        </div>
        <CreateClientProgramDialog />
      </div>

      {!programs || programs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No programs yet</h3>
                <p className="text-muted-foreground">
                  Create your first custom program to get started
                </p>
              </div>
              <CreateClientProgramDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <CardDescription>
                      Created {format(new Date(program.created_at), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={getLocationTypeColor(program.location_type)}
                  >
                    {program.location_type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {program.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {program.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{program.duration_days} day{program.duration_days !== 1 ? "s" : ""}</span>
                    {program.start_time && program.end_time && (
                      <span className="text-muted-foreground">
                        • {program.start_time} - {program.end_time}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{getLocationText(program)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{getEnrollmentTypeText(program.enrollment_type)}</span>
                    {program.max_participants && (
                      <span className="text-muted-foreground">
                        • Max {program.max_participants}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
