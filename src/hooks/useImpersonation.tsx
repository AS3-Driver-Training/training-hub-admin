
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/components/settings/types";

interface ImpersonationState {
  isImpersonating: boolean;
  originalRole: AppRole | null;
  impersonatedClientId: string | null;
  impersonatedRole: AppRole | null;
}

export function useImpersonation() {
  const [impersonationState, setImpersonationState] = useState<ImpersonationState>({
    isImpersonating: false,
    originalRole: null,
    impersonatedClientId: null,
    impersonatedRole: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored impersonation state on mount
    const storedState = localStorage.getItem('impersonationState');
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        console.log('Loaded impersonation state from localStorage:', parsed);
        setImpersonationState(parsed);
      } catch (error) {
        console.error('Error parsing impersonation state:', error);
        localStorage.removeItem('impersonationState');
      }
    }
    setIsLoading(false);
  }, []);

  const startImpersonation = (clientId: string, originalRole: AppRole) => {
    const newState: ImpersonationState = {
      isImpersonating: true,
      originalRole,
      impersonatedClientId: clientId,
      impersonatedRole: 'client_admin' as AppRole,
    };
    
    console.log('Starting impersonation:', newState);
    setImpersonationState(newState);
    localStorage.setItem('impersonationState', JSON.stringify(newState));
  };

  const exitImpersonation = () => {
    const resetState: ImpersonationState = {
      isImpersonating: false,
      originalRole: null,
      impersonatedClientId: null,
      impersonatedRole: null,
    };
    
    console.log('Exiting impersonation');
    setImpersonationState(resetState);
    localStorage.removeItem('impersonationState');
  };

  return {
    ...impersonationState,
    isLoading,
    startImpersonation,
    exitImpersonation,
  };
}
