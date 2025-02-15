
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
        // First check if we have a user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Auth error:', userError);
          return;
        }

        if (!user) {
          console.log('No user found');
          return;
        }

        console.log('Fetching profile for user:', user.id);
        
        // Then fetch the profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, role, title, status')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }
        
        console.log('Profile data:', profile);

        if (profile) {
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          setUserName(fullName || 'User');
          setUserRole(profile.role);
          setUserTitle(profile.title || '');
          setUserStatus(profile.status);
        } else {
          console.log('No profile found for user');
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
      console.log('Auth state changed:', event, session?.user?.id);
      getProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userName, userRole, userTitle, userStatus, isLoading };
}
