
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

interface EmailRequest {
  email: string;
  token: string;
  clientName: string;
  request: Request;
}

const sendEmail = async (req: EmailRequest) => {
  const url = `https://api.resend.com/emails`;
  const invitationLink = `${new URL(req.request.headers.get("origin") || "").origin}/invitation?token=${req.token}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Training Platform <onboarding@resend.dev>",
      to: [req.email],
      subject: `You're invited to join ${req.clientName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to join ${req.clientName}</h2>
          <p>You have been invited to join the ${req.clientName} organization on our training platform.</p>
          <p>Click the link below to accept the invitation and set up your account:</p>
          <p style="margin: 20px 0;">
            <a href="${invitationLink}" style="background-color: #4F46E5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p>This invitation link will expire in 7 days.</p>
          <p>If you have any questions, please contact support.</p>
        </div>
      `
    }),
  });

  const data = await response.json();
  return data;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { email, token, clientName } = await req.json() as EmailRequest;

    if (!email || !token || !clientName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const emailResult = await sendEmail({ email, token, clientName, request: req });

    return new Response(
      JSON.stringify(emailResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing invitation:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred sending the invitation" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
