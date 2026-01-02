import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body
    const { customer_message, customer_id, quote_id, conversation_history } = await req.json();

    if (!customer_message) {
      return new Response(JSON.stringify({ error: "customer_message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get business
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!business) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get AI settings
    const { data: aiSettings } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("business_id", business.id)
      .single();

    // Check usage limits
    const { data: canGenerate } = await supabase.rpc("increment_suggestion_count", {
      p_business_id: business.id,
    });

    if (!canGenerate) {
      return new Response(JSON.stringify({ 
        error: "Monthly suggestion limit reached",
        limit: aiSettings?.monthly_suggestion_limit || 500,
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get customer info if provided
    let customer = null;
    if (customer_id) {
      const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customer_id)
        .single();
      customer = data;
    }

    // Get quote info if provided
    let quote = null;
    if (quote_id) {
      const { data } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", quote_id)
        .single();
      quote = data;
    }

    // Get relevant prompt templates
    const { data: templates } = await supabase
      .from("ai_prompt_templates")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    // Find matching template based on keywords
    let matchedTemplate = null;
    const lowerMessage = customer_message.toLowerCase();
    
    for (const template of templates || []) {
      const hasKeyword = template.trigger_keywords?.some((kw: string) => 
        lowerMessage.includes(kw.toLowerCase())
      );
      if (hasKeyword) {
        matchedTemplate = template;
        break;
      }
    }

    // Build context
    const context = {
      business: {
        name: business.name,
        industry: business.industry,
        owner_name: business.owner_name,
      },
      customer: customer ? {
        name: customer.name,
        first_name: customer.name?.split(" ")[0],
        is_recurring: customer.is_recurring,
        total_jobs: customer.total_jobs,
      } : null,
      quote: quote ? {
        service_type: quote.service_type,
        amount: quote.quote_amount ? `$${(quote.quote_amount / 100).toFixed(0)}` : null,
        status: quote.status,
      } : null,
      settings: {
        tone: aiSettings?.tone || "friendly",
        emoji_usage: aiSettings?.emoji_usage || "moderate",
        response_length: aiSettings?.response_length || "concise",
        custom_instructions: aiSettings?.custom_instructions,
      },
    };

    // Build the prompt
    const systemPrompt = buildSystemPrompt(context, matchedTemplate);
    const userPrompt = buildUserPrompt(customer_message, context, conversation_history);

    console.log("Calling Lovable AI Gateway...");

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const responseText = aiResponse.choices?.[0]?.message?.content || "";
    
    // Parse suggestions from response
    const suggestions = parseSuggestions(responseText);
    const generationTime = Date.now() - startTime;

    console.log("Generated suggestions:", suggestions);

    // Log suggestion
    const { data: suggestionLog } = await supabase
      .from("ai_suggestions")
      .insert({
        business_id: business.id,
        customer_id,
        quote_id,
        customer_message,
        context_data: context,
        suggestions,
        model_used: "google/gemini-2.5-flash",
        generation_time_ms: generationTime,
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      success: true,
      suggestions,
      suggestion_id: suggestionLog?.id,
      generation_time_ms: generationTime,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Generate smart replies error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildSystemPrompt(context: any, matchedTemplate: any): string {
  const { business, settings } = context;
  
  let prompt = `You are an AI assistant helping ${business.name}, a ${business.industry} business, respond to customer messages via SMS.

RESPONSE STYLE:
- Tone: ${settings.tone}
- Length: ${settings.response_length} (aim for under 160 characters when possible)
- Emoji usage: ${settings.emoji_usage}

RULES:
1. Generate exactly 2 reply options
2. Keep replies SMS-friendly (concise, no complex formatting)
3. Be helpful and move toward booking/closing
4. Never be pushy or aggressive
5. Match the customer's energy level
6. Always be truthful - don't make up information
7. Include a soft call-to-action when appropriate`;

  if (settings.custom_instructions) {
    prompt += `\n\nCUSTOM INSTRUCTIONS:\n${settings.custom_instructions}`;
  }

  if (matchedTemplate) {
    prompt += `\n\nSPECIFIC GUIDANCE FOR THIS TYPE OF MESSAGE:\n${matchedTemplate.response_guidance}`;
    if (matchedTemplate.example_responses?.length) {
      prompt += `\n\nEXAMPLE RESPONSES:\n${matchedTemplate.example_responses.map((e: string) => `- "${e}"`).join("\n")}`;
    }
  }

  prompt += `\n\nOUTPUT FORMAT:
Respond with exactly 2 options in this format:
OPTION 1: [your first reply suggestion]
OPTION 2: [your second reply suggestion]

Do not include any other text or explanation.`;

  return prompt;
}

function buildUserPrompt(message: string, context: any, conversationHistory?: any[]): string {
  const { customer, quote } = context;
  
  let prompt = `CUSTOMER MESSAGE:\n"${message}"`;

  if (customer) {
    prompt += `\n\nCUSTOMER INFO:
- Name: ${customer.name || "Unknown"}
- Returning customer: ${customer.total_jobs > 0 ? `Yes (${customer.total_jobs} previous jobs)` : "No, new customer"}`;
  }

  if (quote) {
    prompt += `\n\nQUOTE DETAILS:
- Service: ${quote.service_type || "General service"}
- Amount: ${quote.amount || "Not yet quoted"}
- Status: ${quote.status}`;
  }

  if (conversationHistory?.length) {
    prompt += `\n\nRECENT CONVERSATION:`;
    conversationHistory.slice(-5).forEach((msg: any) => {
      const role = msg.direction === "inbound" ? "Customer" : "Business";
      prompt += `\n${role}: "${msg.content}"`;
    });
  }

  prompt += `\n\nGenerate 2 helpful reply options:`;

  return prompt;
}

function parseSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  
  // Try to parse OPTION 1: and OPTION 2: format
  const option1Match = text.match(/OPTION 1:\s*(.+?)(?=OPTION 2:|$)/is);
  const option2Match = text.match(/OPTION 2:\s*(.+?)$/is);
  
  if (option1Match) {
    suggestions.push(option1Match[1].trim());
  }
  if (option2Match) {
    suggestions.push(option2Match[1].trim());
  }
  
  // Fallback: split by newlines if format didn't match
  if (suggestions.length === 0) {
    const lines = text.split("\n").filter(l => l.trim().length > 10);
    suggestions.push(...lines.slice(0, 2).map(l => 
      l.replace(/^[\d\.\-\*]+\s*/, "").trim()
    ));
  }
  
  // Ensure we have at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push(text.trim());
  }
  
  return suggestions.slice(0, 3);
}
