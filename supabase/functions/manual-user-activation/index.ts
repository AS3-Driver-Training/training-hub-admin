
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivationRequest {
  email: string;
  password: string;
  clientId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, clientId }: ActivationRequest = await req.json();

    // Create admin Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log(`Manual activation requested for email: ${email}`);

    // Check if user already exists in auth.users
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
    
    let userId: string;

    if (existingUser.user) {
      console.log('User already exists, updating password and confirming email');
      userId = existingUser.user.id;
      
      // Update password and confirm email
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: password,
          email_confirm: true
        }
      );

      if (updateError) {
        console.error('Error updating existing user:', updateError);
        throw updateError;
      }
    } else {
      console.log('Creating new user');
      // Create new user with confirmed email
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: email.split('@')[0],
          last_name: 'User'
        }
      });

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      userId = newUser.user.id;
    }

    console.log(`User processed with ID: ${userId}`);

    // Find pending invitation for this email
    const { data: invitations, error: invError } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending');

    if (invError) {
      console.error('Error fetching invitations:', invError);
      throw invError;
    }

    let acceptedInvitations = 0;

    // Accept all pending invitations for this email
    for (const invitation of invitations || []) {
      console.log(`Processing invitation ${invitation.id} for client ${invitation.client_id}`);

      // Check if user is already added to this client
      const { data: existingClientUser } = await supabase
        .from('client_users')
        .select('id')
        .eq('client_id', invitation.client_id)
        .eq('user_id', userId)
        .single();

      if (!existingClientUser) {
        // Add user to client with the role from invitation
        const { error: clientUserError } = await supabase
          .from('client_users')
          .insert({
            client_id: invitation.client_id,
            user_id: userId,
            role: invitation.role || 'supervisor',
            status: 'active'
          });

        if (clientUserError) {
          console.error('Error adding user to client:', clientUserError);
          throw clientUserError;
        }

        // Add user to default group if one exists
        const { data: defaultGroup } = await supabase
          .from('groups')
          .select('id')
          .eq('client_id', invitation.client_id)
          .eq('is_default', true)
          .single();

        if (defaultGroup) {
          await supabase
            .from('user_groups')
            .insert({
              user_id: userId,
              group_id: defaultGroup.id
            });
        }
      }

      // Mark invitation as accepted
      const { error: updateInvError } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateInvError) {
        console.error('Error updating invitation:', updateInvError);
        throw updateInvError;
      }

      acceptedInvitations++;
    }

    // Update profile if it exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        first_name: email.split('@')[0],
        last_name: 'User',
        status: 'active'
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't throw here as this is not critical
    }

    console.log(`Successfully activated user and accepted ${acceptedInvitations} invitations`);

    return new Response(JSON.stringify({
      success: true,
      message: `User ${email} has been manually activated`,
      userId: userId,
      acceptedInvitations: acceptedInvitations,
      invitations: invitations?.map(inv => ({
        clientId: inv.client_id,
        role: inv.role
      }))
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in manual-user-activation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
