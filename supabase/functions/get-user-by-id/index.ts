
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId, debug } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    if (debug) {
      console.log('Fetching user with ID:', userId);
    }

    // Get user data
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      filter: {
        id: userId
      }
    })

    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }

    if (debug) {
      console.log('User data:', users?.[0] || null);
    }

    return new Response(
      JSON.stringify({ 
        user: users?.[0] || null,
        error: users?.[0] ? null : 'User not found'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
