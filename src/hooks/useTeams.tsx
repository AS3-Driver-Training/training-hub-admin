
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: string;
  name: string;
  group_id: string;
  created_at: string;
  updated_at: string;
  groups?: {
    name: string;
    client_id: string;
    clients?: {
      name: string;
    };
  };
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          groups:group_id (
            name,
            client_id,
            clients:client_id (
              name
            )
          )
        `)
        .order('name');
      
      if (error) {
        console.error("Error fetching teams:", error);
        throw error;
      }
      
      return data || [];
    }
  });
}
