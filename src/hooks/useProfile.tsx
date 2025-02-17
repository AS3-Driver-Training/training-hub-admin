
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
        console.log('Fetching user session...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Auth error:', userError);
          throw userError;
        }
        
        if (!user) {
          console.log('No authenticated user found');
          return;
        }

        console.log('Fetching profile for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, role, title, status, organization_name')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }

        console.log('Profile data received:', profile);
        
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
      console.log('Auth state changed:', event);
      if (session) {
        console.log('Session detected, refreshing profile...');
        getProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userName, userRole, userTitle, userStatus, isLoading };
}
