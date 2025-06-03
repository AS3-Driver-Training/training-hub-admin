
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

  useEffect(() => {
    // Check for stored impersonation state on mount
    const storedState = localStorage.getItem('impersonationState');
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        setImpersonationState(parsed);
      } catch (error) {
        console.error('Error parsing impersonation state:', error);
        localStorage.removeItem('impersonationState');
      }
    }
  }, []);

  const startImpersonation = (clientId: string, originalRole: AppRole) => {
    const newState: ImpersonationState = {
      isImpersonating: true,
      originalRole,
      impersonatedClientId: clientId,
      impersonatedRole: 'client_admin' as AppRole,
    };
    
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
    
    setImpersonationState(resetState);
    localStorage.removeItem('impersonationState');
  };

  return {
    ...impersonationState,
    startImpersonation,
    exitImpersonation,
  };
}
