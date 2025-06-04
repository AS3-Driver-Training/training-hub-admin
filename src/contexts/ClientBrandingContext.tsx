import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useImpersonation } from '@/hooks/useImpersonation';
import { queryKeys } from '@/lib/queryKeys';

interface ClientBrandingData {
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  clientName?: string;
}

interface ClientBrandingContextType {
  branding: ClientBrandingData;
  isLoading: boolean;
  hasClientBranding: boolean;
}

const ClientBrandingContext = createContext<ClientBrandingContextType>({
  branding: {},
  isLoading: false,
  hasClientBranding: false,
});

export const useClientBranding = () => useContext(ClientBrandingContext);

interface ClientBrandingProviderProps {
  children: ReactNode;
}

export function ClientBrandingProvider({ children }: ClientBrandingProviderProps) {
  const impersonation = useImpersonation();

  console.log('ClientBrandingProvider impersonation state:', impersonation);

  // Get the client ID - either from impersonation or user's actual client
  const { data: clientData, isLoading: clientDataLoading } = useQuery({
    queryKey: queryKeys.userClientData(),
    queryFn: async () => {
      try {
        // If impersonating, use the impersonated client ID
        if (impersonation.isImpersonating && impersonation.impersonatedClientId) {
          console.log('Using impersonated client ID:', impersonation.impersonatedClientId);
          return {
            clientId: impersonation.impersonatedClientId,
          };
        }

        // Otherwise, get the user's actual client
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: clientUser, error: clientUserError } = await supabase
          .from('client_users')
          .select('client_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (clientUserError) throw clientUserError;
        if (!clientUser) return null;

        console.log('Using actual client ID:', clientUser.client_id);
        return {
          clientId: clientUser.client_id,
        };
      } catch (error: any) {
        console.error('Error fetching client data:', error);
        return null;
      }
    },
    enabled: !impersonation.isLoading, // Wait for impersonation state to load
  });

  // Get client branding data
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: queryKeys.client(clientData?.clientId || ''),
    queryFn: async () => {
      if (!clientData?.clientId) return null;
      
      console.log('Fetching client branding for:', clientData.clientId);
      const { data, error } = await supabase
        .from('clients')
        .select('name, logo_url, primary_color, secondary_color')
        .eq('id', clientData.clientId)
        .maybeSingle();

      if (error) throw error;
      console.log('Client branding data:', data);
      return data;
    },
    enabled: !!clientData?.clientId,
  });

  const branding: ClientBrandingData = {
    logoUrl: client?.logo_url,
    primaryColor: client?.primary_color || '#C10230',
    secondaryColor: client?.secondary_color || '#FF6B35',
    clientName: client?.name,
  };

  const hasClientBranding = !!(client?.logo_url || 
    (client?.primary_color && client.primary_color !== '#C10230') ||
    (client?.secondary_color && client.secondary_color !== '#FF6B35'));

  const isLoading = impersonation.isLoading || clientDataLoading || clientLoading;

  // Apply CSS variables to document root
  useEffect(() => {
    if (client) {
      const root = document.documentElement;
      root.style.setProperty('--client-primary-override', branding.primaryColor || '#C10230');
      root.style.setProperty('--client-secondary-override', branding.secondaryColor || '#FF6B35');
      console.log('Applied branding colors:', {
        primary: branding.primaryColor,
        secondary: branding.secondaryColor
      });
    }
  }, [client, branding.primaryColor, branding.secondaryColor]);

  return (
    <ClientBrandingContext.Provider value={{ branding, isLoading, hasClientBranding }}>
      {children}
    </ClientBrandingContext.Provider>
  );
}
