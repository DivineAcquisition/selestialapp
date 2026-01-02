import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

// Cost per 1M tokens (Claude 3 Haiku)
const INPUT_COST_PER_M = 0.25;
const OUTPUT_COST_PER_M = 1.25;

interface ConversationMessage {
  direction: 'inbound' | 'outbound';
  content: string;
}

interface CommonService {
  name: string;
  price: number;
  description?: string;
}

interface AISettings {
  tone: string;
  emoji_usage: string;
  response_length: string;
  include_pricing: boolean;
  suggest_upsells: boolean;
  custom_instructions: string | null;
  common_services: CommonService[] | null;
}

interface Context {
  business: {
    name: string;
    industry: string;
    owner_name: string | null;
    phone: string | null;
  };
  customer: {
    name: string | null;
    first_name: string | null;
    is_recurring: boolean;
    total_jobs: number;
    notes: string | null;
  } | null;
  quote: {
    service_type: string | null;
    amount: string | null;
    status: string;
    custom_fields: Record<string, unknown>;
    notes: string | null;
  } | null;
  settings: AISettings;
  conversation_history: ConversationMessage[];
  matched_template: {
    category: string;
    guidance: string;
    examples: string[] | null;
  } | null;
}

// Build system prompt
function buildSystemPrompt(context: Context): string {
  const { business, settings, matched_template } = context;
  
  let prompt = `You are an AI assistant helping ${business.name}, a ${business.industry} business, respond to customer messages via SMS.

RESPONSE STYLE:
- Tone: ${settings.tone}
- Length: ${settings.response_length} (aim for under 160 characters when possible)
- Emoji usage: ${settings.emoji_usage}
${settings.include_pricing ? '- Include specific pricing when relevant and known' : '- Do not mention specific pricing'}
${settings.suggest_upsells ? '- Suggest relevant upsells/add-ons when appropriate' : ''}

RULES:
1. Generate exactly 2 reply options
2. Keep replies SMS-friendly (concise, no complex formatting)
3. Be helpful and move toward booking/closing
4. Never be pushy or aggressive
5. Match the customer's energy level
6. Always be truthful - don't make up information
7. If you don't know something, offer to find out
8. Include a soft call-to-action when appropriate`;

  if (settings.custom_instructions) {
    prompt += `\n\nCUSTOM INSTRUCTIONS FROM BUSINESS:\n${settings.custom_instructions}`;
  }

  if (matched_template) {
    prompt += `\n\nSPECIFIC GUIDANCE FOR THIS TYPE OF MESSAGE:\n${matched_template.guidance}`;
    if (matched_template.examples?.length) {
      prompt += `\n\nEXAMPLE GOOD RESPONSES:\n${matched_template.examples.map((e: string) => `- "${e}"`).join('\n')}`;
    }
  }

  if (settings.common_services?.length) {
    prompt += `\n\nCOMMON SERVICES & PRICING:\n${JSON.stringify(settings.common_services, null, 2)}`;
  }

  prompt += `\n\nOUTPUT FORMAT:
Respond with exactly 2 options in this format:
OPTION 1: [your first reply suggestion]
OPTION 2: [your second reply suggestion]

Do not include any other text or explanation.`;

  return prompt;
}

// Build user prompt with context
function buildUserPrompt(message: string, context: Context): string {
  const { customer, quote, conversation_history } = context;
  
  let prompt = `CUSTOMER MESSAGE:\n"${message}"`;

  if (customer) {
    prompt += `\n\nCUSTOMER INFO:
- Name: ${customer.name || 'Unknown'}
- Returning customer: ${customer.total_jobs > 0 ? `Yes (${customer.total_jobs} previous jobs)` : 'No, new customer'}
- Recurring service: ${customer.is_recurring ? 'Yes' : 'No'}`;
    if (customer.notes) {
      prompt += `\n- Notes: ${customer.notes}`;
    }
  }

  if (quote) {
    prompt += `\n\nQUOTE DETAILS:
- Service: ${quote.service_type || 'General service'}
- Amount: ${quote.amount || 'Not yet quoted'}
- Status: ${quote.status}`;
    if (quote.custom_fields && Object.keys(quote.custom_fields).length > 0) {
      prompt += `\n- Property details: ${JSON.stringify(quote.custom_fields)}`;
    }
    if (quote.notes) {
      prompt += `\n- Notes: ${quote.notes}`;
    }
  }

  if (conversation_history?.length > 0) {
    prompt += `\n\nRECENT CONVERSATION:`;
    conversation_history.slice(-5).forEach((msg: ConversationMessage) => {
      const role = msg.direction === 'inbound' ? 'Customer' : 'Business';
      prompt += `\n${role}: "${msg.content}"`;
    });
  }

  prompt += `\n\nGenerate 2 helpful reply options:`;

  return prompt;
}

// Parse suggestions from Claude response
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
    const lines = text.split('\n').filter(l => l.trim().length > 10);
    suggestions.push(...lines.slice(0, 2).map(l => 
      l.replace(/^[\d.\-*]+\s*/, '').trim()
    ));
  }
  
  // Ensure we have at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push(text.trim());
  }
  
  return suggestions.slice(0, 3); // Max 3 suggestions
}

// Call Claude API directly
async function callClaude(systemPrompt: string, userPrompt: string): Promise<{
  content: string;
  input_tokens: number;
  output_tokens: number;
}> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.content[0]?.text || '',
    input_tokens: data.usage?.input_tokens || 0,
    output_tokens: data.usage?.output_tokens || 0,
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get request body
    const {
      customer_message,
      customer_id,
      quote_id,
      conversation_history,
    } = await req.json();

    if (!customer_message) {
      return new Response(JSON.stringify({ error: 'customer_message required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if AI enabled
    if (!business.ai_enabled) {
      return new Response(JSON.stringify({ error: 'AI features not enabled' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get AI settings
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('business_id', business.id)
      .single();

    // Check usage limits
    const { data: canGenerate } = await supabase.rpc('increment_suggestion_count', {
      p_business_id: business.id,
    });

    if (!canGenerate) {
      return new Response(JSON.stringify({ 
        error: 'Monthly suggestion limit reached',
        limit: aiSettings?.monthly_suggestion_limit || 500,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get customer info if provided
    let customer = null;
    if (customer_id) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customer_id)
        .single();
      customer = data;
    }

    // Get quote info if provided
    let quote = null;
    if (quote_id) {
      const { data } = await supabase
        .from('quotes')
        .select('*, custom_fields')
        .eq('id', quote_id)
        .single();
      quote = data;
    }

    // Get relevant prompt templates
    const { data: templates } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .eq('is_active', true)
      .or(`industry_slug.eq.${business.industry},industry_slug.is.null`)
      .order('priority', { ascending: false });

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

    // Build context object
    const context: Context = {
      business: {
        name: business.name,
        industry: business.industry || 'service',
        owner_name: business.owner_name,
        phone: business.phone,
      },
      customer: customer ? {
        name: customer.name,
        first_name: customer.name?.split(' ')[0] || null,
        is_recurring: customer.is_recurring || false,
        total_jobs: customer.total_jobs || 0,
        notes: customer.notes,
      } : null,
      quote: quote ? {
        service_type: quote.service_type,
        amount: quote.quote_amount ? `$${(quote.quote_amount / 100).toFixed(0)}` : null,
        status: quote.status,
        custom_fields: quote.custom_fields,
        notes: quote.notes,
      } : null,
      settings: {
        tone: aiSettings?.tone || 'friendly',
        emoji_usage: aiSettings?.emoji_usage || 'moderate',
        response_length: aiSettings?.response_length || 'concise',
        include_pricing: aiSettings?.include_pricing ?? true,
        suggest_upsells: aiSettings?.suggest_upsells ?? true,
        custom_instructions: aiSettings?.custom_instructions || null,
        common_services: aiSettings?.common_services || null,
      },
      conversation_history: conversation_history || [],
      matched_template: matchedTemplate ? {
        category: matchedTemplate.category,
        guidance: matchedTemplate.response_guidance,
        examples: matchedTemplate.example_responses,
      } : null,
    };

    // Build the prompts
    const systemPrompt = buildSystemPrompt(context);
    const userPrompt = buildUserPrompt(customer_message, context);

    // Call Claude
    const response = await callClaude(systemPrompt, userPrompt);

    // Parse suggestions from response
    const suggestions = parseSuggestions(response.content);

    // Calculate cost
    const inputTokens = response.input_tokens;
    const outputTokens = response.output_tokens;
    const costCents = (
      (inputTokens / 1_000_000) * INPUT_COST_PER_M * 100 +
      (outputTokens / 1_000_000) * OUTPUT_COST_PER_M * 100
    );

    const generationTime = Date.now() - startTime;

    // Log suggestion
    const { data: suggestionLog } = await supabase
      .from('ai_suggestions')
      .insert({
        business_id: business.id,
        customer_id,
        quote_id,
        customer_message,
        context_data: context,
        suggestions,
        model_used: 'claude-3-haiku-20240307',
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost_cents: costCents,
        generation_time_ms: generationTime,
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      success: true,
      suggestions,
      suggestion_id: suggestionLog?.id,
      tokens: {
        input: inputTokens,
        output: outputTokens,
      },
      generation_time_ms: generationTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generate smart replies error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
