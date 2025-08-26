/**
 * supabase/functions/notify-new-feedback/index.ts
 * @description Sends an email to the project owner when new feedback is created.
 * Accepts POST JSON: { feedback_id: string }
 * Server-side enriches data using Supabase service role (to fetch owner email) and
 * sends via Resend with the server-side RESEND_API_KEY secret.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import Supabase client for Deno via ESM
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const FUNCTION_SIGNATURE = Deno.env.get("FUNCTION_SIGNATURE");

type FeedbackRecord = {
  id: string;
  startsnap_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type StartSnapRecord = {
  id: string;
  user_id: string; // owner
  name: string | null;
  slug: string | null;
};

async function sendEmail(to: string, projectTitle: string, projectSlug: string | null, feedbackId: string) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not set");
  }
  const subject = `New feedback on “${projectTitle || "your project"}” on StartSnap`;
  const projectUrl = projectSlug
    ? `https://startsnap.fun/projects/${projectSlug}#feedback-${feedbackId}`
    : `https://startsnap.fun/projects`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#111827;">
      <h2 style="margin:0 0 12px;">You have new feedback</h2>
      <p style="margin:0 0 12px;">Someone just left feedback on <strong>${projectTitle || "your project"}</strong>.</p>
      <blockquote style="margin:0 0 16px; padding:12px 16px; background:#f9fafb; border-left:4px solid #111827;">A new comment was posted. Click below to view it.</blockquote>
      <p style="margin:0 0 16px;">
        <a href="${projectUrl}" style="display:inline-block; padding:10px 16px; background:#111827; color:#ffffff; text-decoration:none; border-radius:6px;">View feedback</a>
      </p>
      <p style="font-size:12px; color:#6b7280;">You’re receiving this because you own this project on StartSnap.</p>
    </div>
  `;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "StartSnap <no-reply@startsnap.fun>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Resend error (${resp.status}): ${err}`);
  }

  return resp.json();
}

async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Verify shared signature header to prevent public abuse
  const signatureHeader = req.headers.get("x-function-signature");
  if (!FUNCTION_SIGNATURE || !signatureHeader || signatureHeader !== FUNCTION_SIGNATURE) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const payload = await req.json();
    const feedbackId = String(payload?.feedback_id || "").trim();
    if (!feedbackId) {
      return new Response(
        JSON.stringify({ error: "feedback_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Fetch feedback
    const { data: feedback, error: feedbackErr } = await supabase
      .from<FeedbackRecord>("feedbacks")
      .select("id, startsnap_id, user_id, content, created_at")
      .eq("id", feedbackId)
      .single();
    if (feedbackErr || !feedback) {
      return new Response(
        JSON.stringify({ error: "Feedback not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2) Fetch project
    const { data: snap, error: snapErr } = await supabase
      .from<StartSnapRecord>("startsnaps")
      .select("id, user_id, name, slug")
      .eq("id", feedback.startsnap_id)
      .single();
    if (snapErr || !snap) {
      return new Response(
        JSON.stringify({ error: "Project not found for feedback" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3) Lookup owner email via Auth Admin API
    const { data: ownerUser } = await supabase.auth.admin.getUserById(snap.user_id);
    const ownerEmail = ownerUser?.user?.email;
    if (!ownerEmail) {
      return new Response(
        JSON.stringify({ error: "Owner email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4) Send email
    const emailResult = await sendEmail(ownerEmail, snap.name ?? "your project", snap.slug ?? null, feedback.id);

    return new Response(
      JSON.stringify({ ok: true, emailResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

Deno.serve(handler);


