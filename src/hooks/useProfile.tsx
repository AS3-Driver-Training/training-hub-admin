
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
      console.log('Starting getProfile function');
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

        console.log('Found authenticated user:', { userId: user.id, email: user.email });
        
        // Then fetch the profile
        console.log('Attempting to fetch profile for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, role, title, status, organization_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }
        
        console.log('Raw profile data received:', profile);

        if (profile) {
          console.log('Processing profile data:', {
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role,
            title: profile.title,
            status: profile.status,
            organization_name: profile.organization_name
          });

          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          setUserName(fullName || 'User');
          setUserRole(profile.role);
          setUserTitle(profile.title || '');
          setUserStatus(profile.status);

          console.log('Profile state updated with:', {
            fullName,
            role: profile.role,
            title: profile.title,
            status: profile.status,
            organization_name: profile.organization_name
          });
        } else {
          console.log('No profile data found for user');
        }
      } catch (error) {
        console.error('Error in getProfile:', error);
        toast.error('Error loading user profile');
      } finally {
        setIsLoading(false);
        console.log('Profile loading completed');
      }
    };

    console.log('Setting up profile fetching');
    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, userId: session?.user?.id });
      getProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userName, userRole, userTitle, userStatus, isLoading };
}
