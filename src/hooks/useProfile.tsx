
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProfile() {
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState<"superadmin" | "admin" | "staff">("staff");
  const [userTitle, setUserTitle] = useState("");
  const [userStatus, setUserStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) return;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, role, title, status, organization_name')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;

        if (profile) {
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          setUserName(fullName || 'User');
          setUserRole(profile.role);
          setUserTitle(profile.title || '');
          setUserStatus(profile.status);
        }
      } catch (error) {
        console.error('Error in getProfile:', error);
        toast.error('Error loading user profile');
      } finally {
        setIsLoading(false);
      }
    };

    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) getProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userName, userRole, userTitle, userStatus, isLoading };
}
