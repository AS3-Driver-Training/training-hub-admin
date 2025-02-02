import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  clientName: string;
  email: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientName, email, token }: InvitationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>",
      to: [email],
      subject: `Invitation to join ${clientName}`,
      html: `
        <h1>You've been invited to join ${clientName}!</h1>
        <p>Click the link below to accept your invitation:</p>
        <p><a href="${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token}">Accept Invitation</a></p>
        <p>This invitation will expire in 7 days.</p>
        <p>Best regards,<br>The Team</p>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);