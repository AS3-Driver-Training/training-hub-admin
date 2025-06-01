
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

  const isInternalAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  if (!isInternalAdmin) {
    return null;
  }

  return (
    <Card className="border shadow-sm print:hidden mb-6">
      <CardContent className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Course Management</h3>
            <p className="text-xs text-muted-foreground">Administrative actions</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate(`/events/${courseId}/edit`)}
              variant="outline"
              size="sm"
            >
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Button>
            
            <Button 
              onClick={() => navigate(`/events/${courseId}/manage`)}
              variant="outline"
              size="sm"
            >
              <Users className="mr-1 h-3 w-3" />
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
