import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

interface WebhookPayload {
  event?: string;
  type?: string;
  idempotency_key?: string;
  
  // Customer fields
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  customer_id?: string;
  
  // Job fields
  job_id?: string;
  job_type?: string;
  job_amount?: number;
  job_status?: string;
  scheduled_at?: string;
  completed_at?: string;
  
  // Invoice fields
  invoice_id?: string;
  invoice_amount?: number;
  paid_at?: string;
  
  // Metadata
  source?: string;
  [key: string]: unknown;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Extract webhook key from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const webhookKey = pathParts[pathParts.length - 1];
    
    console.log('Received webhook request with key:', webhookKey);
    
    if (!webhookKey || webhookKey === 'webhook-receiver') {
      console.error('Webhook key required in URL path');
      return new Response(JSON.stringify({ 
        error: 'Webhook key required in URL path' 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Find webhook config by key
    const { data: config, error: configError } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('webhook_key', webhookKey)
      .eq('is_active', true)
      .single();
    
    if (configError || !config) {
      console.error('Invalid or inactive webhook:', configError);
      return new Response(JSON.stringify({ 
        error: 'Invalid or inactive webhook' 
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Found webhook config for business:', config.business_id);
    
    // Rate limiting check
    const today = new Date().toISOString().split('T')[0];
    if (config.requests_reset_at !== today) {
      await supabase
        .from('webhook_configs')
        .update({ requests_today: 1, requests_reset_at: today })
        .eq('id', config.id);
    } else if (config.requests_today >= config.daily_limit) {
      console.error('Daily request limit exceeded');
      return new Response(JSON.stringify({ 
        error: 'Daily request limit exceeded' 
      }), { 
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      await supabase
        .from('webhook_configs')
        .update({ requests_today: config.requests_today + 1 })
        .eq('id', config.id);
    }
    
    // Parse payload
    const payload: WebhookPayload = await req.json();
    console.log('Received payload:', JSON.stringify(payload));
    
    // Validate required fields
    const eventType = payload.event || payload.type || 'unknown';
    
    if (eventType === 'unknown') {
      console.error('Event type required');
      return new Response(JSON.stringify({ 
        error: 'Event type required (event or type field)' 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Generate idempotency key if not provided
    const idempotencyKey = payload.idempotency_key || 
      `${eventType}-${payload.customer_phone || ''}-${payload.job_id || ''}-${Date.now()}`;
    
    // Check for duplicate
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('business_id', config.business_id)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    
    if (existing) {
      console.log('Duplicate event detected');
      return new Response(JSON.stringify({ 
        received: true,
        duplicate: true,
        message: 'Event already processed'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Log the event
    const { data: event, error: eventError } = await supabase
      .from('webhook_events')
      .insert({
        business_id: config.business_id,
        event_type: eventType,
        payload,
        idempotency_key: idempotencyKey,
        source_ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent'),
      })
      .select()
      .single();
    
    if (eventError) {
      console.error('Failed to log event:', eventError);
      throw eventError;
    }
    
    console.log('Event logged:', event.id);
    
    // Process the event
    let result = { type: null as string | null, id: null as string | null };
    let processingError: string | null = null;
    
    try {
      switch (eventType) {
        case 'job.completed':
        case 'job_completed':
          result = await handleJobCompleted(supabase, config.business_id, payload);
          break;
          
        case 'job.scheduled':
        case 'job_scheduled':
          result = await handleJobScheduled(supabase, config.business_id, payload);
          break;
          
        case 'customer.created':
        case 'customer_created':
          result = await handleCustomerCreated(supabase, config.business_id, payload);
          break;
          
        case 'customer.updated':
        case 'customer_updated':
          result = await handleCustomerUpdated(supabase, config.business_id, payload);
          break;
          
        case 'invoice.paid':
        case 'invoice_paid':
          result = await handleInvoicePaid(supabase, config.business_id, payload);
          break;
          
        case 'estimate.created':
        case 'quote.created':
          result = await handleQuoteCreated(supabase, config.business_id, payload);
          break;
          
        case 'estimate.accepted':
        case 'quote.accepted':
          result = await handleQuoteAccepted(supabase, config.business_id, payload);
          break;
          
        default:
          console.log(`Unknown event type: ${eventType}`);
          await supabase
            .from('webhook_events')
            .update({ status: 'ignored' })
            .eq('id', event.id);
            
          return new Response(JSON.stringify({ 
            received: true,
            processed: false,
            message: `Unknown event type: ${eventType}`
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      }
      
      console.log('Event processed successfully:', result);
      
      await supabase
        .from('webhook_events')
        .update({ 
          status: 'processed',
          processed_at: new Date().toISOString(),
          result_type: result.type,
          result_id: result.id,
        })
        .eq('id', event.id);
        
    } catch (err) {
      processingError = err instanceof Error ? err.message : 'Unknown error';
      console.error('Processing error:', processingError);
      
      await supabase
        .from('webhook_events')
        .update({ 
          status: 'failed',
          error_message: processingError,
          processed_at: new Date().toISOString(),
        })
        .eq('id', event.id);
    }
    
    // Update webhook config stats
    await supabase
      .from('webhook_configs')
      .update({
        last_event_at: new Date().toISOString(),
        total_events_received: config.total_events_received + 1,
        total_events_processed: processingError ? config.total_events_processed : config.total_events_processed + 1,
        total_events_failed: processingError ? config.total_events_failed + 1 : config.total_events_failed,
      })
      .eq('id', config.id);
    
    return new Response(JSON.stringify({ 
      received: true,
      processed: !processingError,
      event_id: event.id,
      result,
      error: processingError,
      duration_ms: Date.now() - startTime,
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal error',
      received: false,
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ============================================
// EVENT HANDLERS
// ============================================

async function handleJobCompleted(
  supabase: any, 
  businessId: string, 
  payload: WebhookPayload
): Promise<{ type: string; id: string | null }> {
  
  if (!payload.customer_phone) {
    throw new Error('customer_phone required for job.completed');
  }
  
  // Find or create customer
  const { data: customerId, error: customerError } = await supabase.rpc('find_or_create_customer', {
    p_business_id: businessId,
    p_phone: payload.customer_phone,
    p_name: payload.customer_name || null,
    p_email: payload.customer_email || null,
    p_address: payload.customer_address || null,
    p_external_id: payload.customer_id || null,
    p_external_source: payload.source || null,
  });
  
  if (customerError) {
    console.error('Error finding/creating customer:', customerError);
    throw customerError;
  }
  
  console.log('Customer ID:', customerId);
  
  // Find matching quote
  const normalizedPhone = normalizePhone(payload.customer_phone);
  const { data: quote } = await supabase
    .from('quotes')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_phone', normalizedPhone)
    .eq('status', 'won')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const completedAt = payload.completed_at || new Date().toISOString();
  
  if (quote) {
    await supabase
      .from('quotes')
      .update({
        customer_id: customerId,
        job_status: 'completed',
        job_completed_at: completedAt,
        external_job_id: payload.job_id,
        final_job_amount: payload.job_amount || undefined,
      })
      .eq('id', quote.id);
  }
  
  // Recalculate stats
  await supabase.rpc('update_customer_stats', { p_customer_id: customerId });
  await supabase.rpc('calculate_health_score', { p_customer_id: customerId });
  
  // Log activity
  await supabase.from('activity_logs').insert({
    business_id: businessId,
    action: 'job_completed',
    description: `Job completed for ${payload.customer_name || payload.customer_phone} (via webhook)`,
    quote_id: quote?.id || null,
  });
  
  return { type: 'customer', id: customerId };
}

async function handleJobScheduled(
  supabase: any, 
  businessId: string, 
  payload: WebhookPayload
): Promise<{ type: string; id: string | null }> {
  
  if (!payload.customer_phone) {
    throw new Error('customer_phone required for job.scheduled');
  }
  
  const { data: customerId } = await supabase.rpc('find_or_create_customer', {
    p_business_id: businessId,
    p_phone: payload.customer_phone,
    p_name: payload.customer_name || null,
    p_email: payload.customer_email || null,
    p_address: null,
    p_external_id: payload.customer_id || null,
    p_external_source: payload.source || null,
  });
  
  const normalizedPhone = normalizePhone(payload.customer_phone);
  const { data: quote } = await supabase
    .from('quotes')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_phone', normalizedPhone)
    .in('status', ['won', 'active', 'new'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (quote) {
    await supabase
      .from('quotes')
      .update({
        customer_id: customerId,
        job_status: 'scheduled',
        job_scheduled_at: payload.scheduled_at,
        external_job_id: payload.job_id,
        status: 'won',
      })
      .eq('id', quote.id);
  }
  
  if (payload.scheduled_at) {
    await supabase
      .from('customers')
      .update({ next_service_at: payload.scheduled_at })
      .eq('id', customerId);
  }
  
  await supabase.from('activity_logs').insert({
    business_id: businessId,
    action: 'job_scheduled',
    description: `Job scheduled for ${payload.customer_name || payload.customer_phone}`,
    quote_id: quote?.id || null,
  });
  
  return { type: 'quote', id: quote?.id || null };
}

async function handleCustomerCreated(
  supabase: any, 
  businessId: string, 
  payload: WebhookPayload
): Promise<{ type: string; id: string | null }> {
  
  if (!payload.customer_phone) {
    throw new Error('customer_phone required for customer.created');
  }
  
  const { data: customerId } = await supabase.rpc('find_or_create_customer', {
    p_business_id: businessId,
    p_phone: payload.customer_phone,
    p_name: payload.customer_name || null,
    p_email: payload.customer_email || null,
    p_address: payload.customer_address || null,
    p_external_id: payload.customer_id || null,
    p_external_source: payload.source || null,
  });
  
  await supabase.from('activity_logs').insert({
    business_id: businessId,
    action: 'customer_synced',
    description: `Customer synced: ${payload.customer_name || payload.customer_phone}`,
  });
  
  return { type: 'customer', id: customerId };
}

async function handleCustomerUpdated(
  supabase: any, 
  businessId: string, 
  payload: WebhookPayload
): Promise<{ type: string; id: string | null }> {
  
  if (!payload.customer_phone) {
    throw new Error('customer_phone required for customer.updated');
  }
  
  const { data: customerId } = await supabase.rpc('find_or_create_customer', {
    p_business_id: businessId,
    p_phone: payload.customer_phone,
    p_name: payload.customer_name || null,
    p_email: payload.customer_email || null,
    p_address: payload.customer_address || null,
    p_external_id: payload.customer_id || null,
    p_external_source: payload.source || null,
  });
  
  return { type: 'customer', id: customerId };
}

async function handleInvoicePaid(
  supabase: any, 
  businessId: string, 
  payload: WebhookPayload
): Promise<{ type: string; id: string | null }> {
  
  if (!payload.customer_phone) {
    throw new Error('customer_phone required for invoice.paid');
  }
  
  const normalizedPhone = normalizePhone(payload.customer_phone);
  const { data: customer } = await supabase
    .from('customers')
    .select('id, total_spent')
    .eq('business_id', businessId)
    .eq('phone', normalizedPhone)
    .maybeSingle();
  
  if (customer && payload.invoice_amount) {
    await supabase
      .from('customers')
      .update({
        total_spent: customer.total_spent + payload.invoice_amount,
      })
      .eq('id', customer.id);
    
    await supabase.rpc('update_customer_stats', { p_customer_id: customer.id });
  }
  
  await supabase.from('activity_logs').insert({
    business_id: businessId,
    action: 'invoice_paid',
    description: `Invoice paid: $${((payload.invoice_amount || 0) / 100).toFixed(2)} from ${payload.customer_name || payload.customer_phone}`,
  });
  
  return { type: 'customer', id: customer?.id || null };
}

async function handleQuoteCreated(
  supabase: any, 
  businessId: string, 
  payload: WebhookPayload
): Promise<{ type: string; id: string | null }> {
  
  if (!payload.customer_phone) {
    throw new Error('customer_phone required for quote.created');
  }
  
  const { data: customerId } = await supabase.rpc('find_or_create_customer', {
    p_business_id: businessId,
    p_phone: payload.customer_phone,
    p_name: payload.customer_name || null,
    p_email: payload.customer_email || null,
    p_address: null,
    p_external_id: payload.customer_id || null,
    p_external_source: payload.source || null,
  });
  
  // Check if quote already exists
  if (payload.job_id) {
    const { data: existing } = await supabase
      .from('quotes')
      .select('id')
      .eq('business_id', businessId)
      .eq('external_job_id', payload.job_id)
      .maybeSingle();
    
    if (existing) {
      return { type: 'quote', id: existing.id };
    }
  }
  
  // Get default sequence
  const { data: defaultSequence } = await supabase
    .from('sequences')
    .select('id')
    .eq('business_id', businessId)
    .eq('is_default', true)
    .maybeSingle();
  
  const normalizedPhone = normalizePhone(payload.customer_phone);
  
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      customer_name: payload.customer_name || 'Unknown',
      customer_phone: normalizedPhone,
      customer_email: payload.customer_email,
      service_type: payload.job_type || 'Service',
      quote_amount: payload.job_amount || 0,
      sequence_id: defaultSequence?.id,
      external_job_id: payload.job_id,
      status: 'new',
    })
    .select()
    .single();
  
  if (quoteError) throw quoteError;
  
  await supabase.from('activity_logs').insert({
    business_id: businessId,
    action: 'quote_synced',
    description: `Quote synced: ${payload.customer_name} - $${((payload.job_amount || 0) / 100).toFixed(2)}`,
    quote_id: quote.id,
  });
  
  return { type: 'quote', id: quote.id };
}

async function handleQuoteAccepted(
  supabase: any, 
  businessId: string, 
  payload: WebhookPayload
): Promise<{ type: string; id: string | null }> {
  
  let quote;
  
  if (payload.job_id) {
    const { data } = await supabase
      .from('quotes')
      .select('id')
      .eq('business_id', businessId)
      .eq('external_job_id', payload.job_id)
      .maybeSingle();
    quote = data;
  }
  
  if (!quote && payload.customer_phone) {
    const normalizedPhone = normalizePhone(payload.customer_phone);
    const { data } = await supabase
      .from('quotes')
      .select('id')
      .eq('business_id', businessId)
      .eq('customer_phone', normalizedPhone)
      .in('status', ['new', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    quote = data;
  }
  
  if (quote) {
    await supabase
      .from('quotes')
      .update({
        status: 'won',
        status_changed_at: new Date().toISOString(),
        final_job_amount: payload.job_amount,
      })
      .eq('id', quote.id);
    
    // Cancel pending follow-up messages
    await supabase
      .from('message_queue')
      .update({ status: 'cancelled' })
      .eq('quote_id', quote.id)
      .eq('status', 'pending');
    
    await supabase.from('activity_logs').insert({
      business_id: businessId,
      action: 'quote_won',
      description: `Quote accepted (via webhook): $${((payload.job_amount || 0) / 100).toFixed(2)}`,
      quote_id: quote.id,
    });
  }
  
  return { type: 'quote', id: quote?.id || null };
}
