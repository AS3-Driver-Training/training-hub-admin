
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      throw new Error('Valid email is required')
    }

    console.log('Searching for user with email:', email)

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

    // Use auth.admin.listUsers with exact email match
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      filter: {
        email: email
      }
    })

    if (error) {
      console.error('Error fetching user:', error)
      throw error
    }

    // Ensure we only return a user if there's an exact match
    const exactMatch = users?.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())
    console.log('Found user:', exactMatch ? 'yes' : 'no')

    return new Response(
      JSON.stringify({ user: exactMatch || null }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
