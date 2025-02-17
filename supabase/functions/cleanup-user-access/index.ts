
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First, let's check if the user exists and their current role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'c7a650b2-62e9-49b6-8bdd-115ec458072c') // pmonasterio@yahoo.com user ID
      .single()

    if (profileError) throw profileError

    // Remove all client_user entries for this user except their primary client
    const { error: deleteError } = await supabase
      .from('client_users')
      .delete()
      .eq('user_id', 'c7a650b2-62e9-49b6-8bdd-115ec458072c')

    if (deleteError) throw deleteError

    // Now add them back only to their correct client with the right role
    const { error: insertError } = await supabase
      .from('client_users')
      .insert({
        user_id: 'c7a650b2-62e9-49b6-8bdd-115ec458072c',
        client_id: '4beb3c20-91dd-4077-87f7-9f31e03f1854', // Acme Corp client ID
        role: 'admin',
        status: 'active'
      })

    if (insertError) throw insertError

    // Update their profile to ensure they're not a superadmin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'staff' })
      .eq('id', 'c7a650b2-62e9-49b6-8bdd-115ec458072c')

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ message: 'User access cleaned up successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
