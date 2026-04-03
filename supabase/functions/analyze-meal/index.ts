import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-supabase-authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are a nutrition analyst for Bangladeshi food. Analyze the meal photo and estimate nutrition values with realistic portions.

Common Bangladeshi foods: rice, dal, bhaji, fish curry, chicken curry, paratha, roti, egg dishes, soy chunks, beef bhuna, etc.

Be accurate with calorie estimates -- a plate of rice with curry is typically 400-600 kcal, not 1000 kcal. A single egg is ~70 kcal. Be realistic.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: SYSTEM_PROMPT + "\n\nReturn ONLY a JSON object with these exact fields:\n{\"name\": \"...\", \"calories\": ..., \"protein\": ..., \"carbs\": ..., \"fat\": ..., \"fiber\": ..., \"healthScore\": ..., \"healthNote\": \"...\", \"items\": [...], \"serving\": \"...\"}" },
              { inline_data: { mime_type: "image/jpeg", data: imageBase64 } },
            ],
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                calories: { type: "NUMBER" },
                protein: { type: "NUMBER" },
                carbs: { type: "NUMBER" },
                fat: { type: "NUMBER" },
                fiber: { type: "NUMBER" },
                healthScore: { type: "NUMBER" },
                healthNote: { type: "STRING" },
                items: { type: "ARRAY", items: { type: "STRING" } },
                serving: { type: "STRING" },
              },
              required: [
                "name", "calories", "protein", "carbs", "fat",
                "fiber", "healthScore", "healthNote", "items", "serving",
              ],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API error:", response.status, errorBody);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `AI analysis failed. Please try again.` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Gemini response:", JSON.stringify(data));
      throw new Error("Empty response from Gemini API");
    }

    const nutrition = JSON.parse(text);
    return new Response(JSON.stringify(nutrition), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-meal error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


