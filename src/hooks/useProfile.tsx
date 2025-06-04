
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppRole } from "@/components/settings/types";
import { useImpersonation } from "./useImpersonation";

interface ClientUser {
  client_id: string;
  role: string;
  status: string;
}

interface UserTeam {
  team_id: string;
  team_name: string;
  group_id: string;
  group_name: string;
  client_id: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: AppRole;
  title: string | null;
  status: string;
  organization_name: string | null;
  email: string | null;
  clientUsers?: ClientUser[];
  userTeams?: UserTeam[];
  impersonation?: {
    isImpersonating: boolean;
    originalRole: AppRole | null;
    impersonatedClientId: string | null;
    impersonatedRole: AppRole | null;
  };
}

export function useProfile() {
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState<AppRole>("staff");
  const [userTitle, setUserTitle] = useState("");
  const [userStatus, setUserStatus] = useState("active");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const impersonation = useImpersonation();

  useEffect(() => {
    // Don't fetch profile until impersonation state is loaded
    if (impersonation.isLoading) {
      console.log('Waiting for impersonation state to load...');
      return;
    }

    console.log('Profile hook - impersonation state loaded:', impersonation);

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
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role, title, status, organization_name, email')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }

        console.log('Profile data received:', profileData);
        
        if (profileData) {
          const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
          setUserName(fullName || 'User');
          
          // Use impersonated role if impersonating, otherwise use actual role
          const effectiveRole = impersonation.isImpersonating 
            ? (impersonation.impersonatedRole || 'client_admin')
            : profileData.role;
          
          console.log('Profile hook - setting effective role:', {
            actualRole: profileData.role,
            impersonatedRole: impersonation.impersonatedRole,
            isImpersonating: impersonation.isImpersonating,
            effectiveRole
          });
          
          setUserRole(effectiveRole as AppRole);
          setUserTitle(profileData.title || '');
          setUserStatus(profileData.status);

          // Fetch client users data
          const { data: clientUsers, error: clientUsersError } = await supabase
            .from('client_users')
            .select('client_id, role, status')
            .eq('user_id', user.id)
            .eq('status', 'active');

          if (clientUsersError) {
            console.error('Client users fetch error:', clientUsersError);
          }

          // Fetch user teams and groups data for better access control
          const { data: userTeams, error: userTeamsError } = await supabase
            .from('user_teams')
            .select(`
              team_id,
              teams:team_id (
                name,
                group_id,
                groups:group_id (
                  name,
                  client_id
                )
              )
            `)
            .eq('user_id', user.id);

          if (userTeamsError) {
            console.error('User teams fetch error:', userTeamsError);
          }

          // Transform teams data for easier access
          const transformedTeams: UserTeam[] = (userTeams || []).map(ut => ({
            team_id: ut.team_id,
            team_name: ut.teams?.name || '',
            group_id: ut.teams?.group_id || '',
            group_name: ut.teams?.groups?.name || '',
            client_id: ut.teams?.groups?.client_id || ''
          }));

          // Create the profile object with current impersonation state
          const completeProfile: Profile = {
            ...profileData,
            clientUsers: clientUsers || [],
            userTeams: transformedTeams,
            impersonation: {
              isImpersonating: impersonation.isImpersonating,
              originalRole: impersonation.originalRole,
              impersonatedClientId: impersonation.impersonatedClientId,
              impersonatedRole: impersonation.impersonatedRole,
            }
          };

          console.log('Profile hook - complete profile created:', completeProfile);
          setProfile(completeProfile);
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
  }, [impersonation.isLoading, impersonation.isImpersonating, impersonation.impersonatedRole, impersonation.impersonatedClientId, impersonation.originalRole]);

  return { 
    userName, 
    userRole, 
    userTitle, 
    userStatus, 
    profile,
    isLoading: isLoading || impersonation.isLoading,
    impersonation
  };
}
