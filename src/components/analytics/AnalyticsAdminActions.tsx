
import { useNavigate } from "react-router-dom";
import { Edit, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsAdminActionsProps {
  courseId: string;
  courseName: string;
}

export function AnalyticsAdminActions({ courseId, courseName }: AnalyticsAdminActionsProps) {
  const navigate = useNavigate();

  // Check if user is admin or superadmin
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="border shadow-sm print:hidden">
      <CardContent className="pt-6 px-6 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h3 className="text-lg font-medium">Course Management</h3>
            <p className="text-sm text-muted-foreground">
              Administrative actions for {courseName}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate(`/events/${courseId}/edit`)}
              variant="outline"
              className="whitespace-nowrap"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Course Details
            </Button>
            
            <Button 
              onClick={() => navigate(`/events/${courseId}/manage`)}
              variant="outline"
              className="whitespace-nowrap"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Students
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
