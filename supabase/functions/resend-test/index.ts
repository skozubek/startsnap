/**
 * supabase/functions/resend-test/index.ts
 * @description Minimal Supabase Edge Function to send a test email via Resend using a server-side secret.
 * Reads RESEND_API_KEY from environment, never exposing it to the client. Accepts POST with optional JSON
 * body: { to?: string, subject?: string, html?: string }. Defaults send to delivered@resend.dev.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

/**
 * @description Handles incoming HTTP requests, validates input, and forwards an email request to Resend.
 * @param {Request} req - Incoming request (expects POST JSON body)
 * @returns {Promise<Response>} JSON response with Resend API result or error
 */
async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not set in environment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { to, subject, html } = await req.json().catch(() => ({ }));
    const safeTo = typeof to === "string" && to.includes("@") ? to : "delivered@resend.dev";
    const safeSubject = typeof subject === "string" && subject.trim().length > 0
      ? subject
      : "StartSnap Resend Test";
    const safeHtml = typeof html === "string" && html.trim().length > 0
      ? html
      : "<strong>It works!</strong>";

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "StartSnap <no-reply@startsnap.fun>",
        to: [safeTo],
        subject: safeSubject,
        html: safeHtml,
      }),
    });

    const data = await resendResponse.json();
    const status = resendResponse.ok ? 200 : resendResponse.status;
    return new Response(
      JSON.stringify({ ok: resendResponse.ok, status, data }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

Deno.serve(handleRequest);


