
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, clientId, role } = await req.json()

    console.log('Manual user activation request:', { email, clientId, role });

    // Validate required fields
    if (!email || !password || !clientId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(email)
    
    if (existingUser.user) {
      console.log('User already exists:', email);
      return new Response(
        JSON.stringify({ success: false, error: 'User with this email already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create the user with email confirmed
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This bypasses email confirmation
    })

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ success: false, error: createError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('User created successfully:', newUser.user?.id);

    // Add user to the client
    const { error: clientUserError } = await supabaseClient
      .from('client_users')
      .insert({
        client_id: clientId,
        user_id: newUser.user.id,
        role: role || 'supervisor',
        status: 'active'
      })

    if (clientUserError) {
      console.error('Error adding user to client:', clientUserError);
      
      // Clean up: delete the user if we can't add them to the client
      await supabaseClient.auth.admin.deleteUser(newUser.user.id)
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to add user to client: ' + clientUserError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Check if there's a pending invitation for this email and client
    const { data: invitation } = await supabaseClient
      .from('invitations')
      .select('id')
      .eq('email', email)
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .single()

    // If there's a pending invitation, mark it as accepted
    if (invitation) {
      await supabaseClient
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)
      
      console.log('Marked invitation as accepted:', invitation.id);
    }

    // Add user to default group if one exists
    const { data: defaultGroup } = await supabaseClient
      .from('groups')
      .select('id')
      .eq('client_id', clientId)
      .eq('is_default', true)
      .single()

    if (defaultGroup) {
      await supabaseClient
        .from('user_groups')
        .insert({
          user_id: newUser.user.id,
          group_id: defaultGroup.id
        })
      
      console.log('Added user to default group:', defaultGroup.id);
    }

    console.log('User activation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User activated successfully',
        userId: newUser.user.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
