// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ai-vibe-log-formatter' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    const { rawContent, logType } = await req.json();
    console.log('Received rawContent:', rawContent);
    console.log('Received logType:', logType);
    if (typeof rawContent !== 'string' || typeof logType !== 'string') {
      return new Response(JSON.stringify({
        error: 'Invalid input'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    console.log('GEMINI_API_KEY found:', !!GEMINI_API_KEY);
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({
        error: 'API key not found'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `
                You are an expert technical writer for a platform called startsnap.fun. Your task is to take a user's raw 'brain dump' for a project update and transform it into a concise, well-structured Vibe Log entry using GitHub Flavored Markdown.

                IMPORTANT FORMATTING RULES:
                - Output clean markdown directly without any wrapper code blocks
                - Use code blocks only for actual code snippets within the content
                - Start directly with your markdown content (headings, text, etc.)

                The entry's tone should be slightly enthusiastic but professional. Use headings, bold text for emphasis, and bulleted or numbered lists to improve readability. Do NOT invent new information. Base your entry ONLY on the text provided.

                The type of this Vibe Log entry is: **'${logType}'**.
                - If the type is 'feature' or 'fix', focus on the what and why.
                - If the type is 'aimagic', highlight the innovative use of AI.
                - If the type is 'idea', make it sound exciting and conceptual.

                Here is the user's raw text:
                ---
                ${rawContent}
                ---

                Generate the polished Markdown entry now (remember: no wrapper code blocks):
              `
            }
          ]
        }
      ]
    };
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prompt)
    });
    console.log('Response from Gemini API:', response.status);
    const responseData = await response.json();
    console.log('Full response data from Gemini API:', JSON.stringify(responseData, null, 2)); // Log the full response in a readable format
    if (!response.ok) {
      console.log('Error from Gemini API:', responseData);
      return new Response(JSON.stringify({
        error: responseData.error.message
      }), {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Access the generated text from the response structure
    if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts.length > 0) {
      let generatedText = responseData.candidates[0].content.parts[0].text || "No content generated";

      // Post-process to remove wrapper code blocks if present
      generatedText = generatedText.trim();

      // Remove markdown code block wrapper if it wraps the entire content
      if (generatedText.startsWith('```markdown\n') && generatedText.endsWith('\n```')) {
        generatedText = generatedText.slice(12, -4).trim();
      } else if (generatedText.startsWith('```\n') && generatedText.endsWith('\n```')) {
        generatedText = generatedText.slice(4, -4).trim();
      } else if (generatedText.startsWith('```') && generatedText.endsWith('```')) {
        // Handle case where there might not be newlines
        const firstNewline = generatedText.indexOf('\n');
        const lastNewline = generatedText.lastIndexOf('\n');
        if (firstNewline > 0 && lastNewline > firstNewline) {
          generatedText = generatedText.slice(firstNewline + 1, lastNewline).trim();
        }
      }

      console.log('Generated text:', generatedText);
      return new Response(JSON.stringify({
        formattedLog: generatedText
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else {
      console.log('Unexpected response structure:', responseData);
      return new Response(JSON.stringify({
        error: 'No content generated or unexpected response structure'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
