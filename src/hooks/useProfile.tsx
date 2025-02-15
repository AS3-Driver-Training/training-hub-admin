
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, role, title, status')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (profile) {
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          setUserName(fullName || 'User');
          setUserRole(profile.role);
          setUserTitle(profile.title || '');
          setUserStatus(profile.status);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading user profile');
      } finally {
        setIsLoading(false);
      }
    };

    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        getProfile();
      } else if (event === 'SIGNED_OUT') {
        setUserName('User');
        setUserRole('staff');
        setUserTitle('');
        setUserStatus('active');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userName, userRole, userTitle, userStatus, isLoading };
}
