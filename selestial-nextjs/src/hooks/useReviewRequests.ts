import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

interface ReviewRequest {
  id: string;
  created_at: string;
  customer_id: string;
  quote_id: string | null;
  platform: string;
  review_link: string;
  sent_at: string | null;
  sent_via: string | null;
  clicked_at: string | null;
  click_count: number;
  review_received: boolean;
  review_rating: number | null;
  status: string;
  customers?: {
    name: string;
    phone: string;
  };
}

interface ReviewStats {
  total_sent: number;
  total_clicked: number;
  total_reviewed: number;
  click_rate: number;
  conversion_rate: number;
}

export function useReviewRequests() {
  const { business } = useBusiness();
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total_sent: 0,
    total_clicked: 0,
    total_reviewed: 0,
    click_rate: 0,
    conversion_rate: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!business) return;

    try {
      const { data, error } = await supabase
        .from('review_requests')
        .select(`
          *,
          customers(name, phone)
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const typedData = (data || []) as unknown as ReviewRequest[];
      setRequests(typedData);

      // Calculate stats
      const sent = typedData.filter(r => r.sent_at);
      const clicked = typedData.filter(r => r.clicked_at);
      const reviewed = typedData.filter(r => r.review_received);

      setStats({
        total_sent: sent.length,
        total_clicked: clicked.length,
        total_reviewed: reviewed.length,
        click_rate: sent.length > 0 ? (clicked.length / sent.length) * 100 : 0,
        conversion_rate: sent.length > 0 ? (reviewed.length / sent.length) * 100 : 0,
      });
    } catch (err) {
      console.error('Failed to fetch review requests:', err);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const sendReviewRequest = useCallback(async (
    customerId: string, 
    quoteId?: string, 
    platform?: string,
    sendImmediately: boolean = true
  ) => {
    if (!business) return { error: new Error('No business') };

    try {
      // Get customer and business info
      const { data: customer } = await supabase
        .from('customers')
        .select('phone, name')
        .eq('id', customerId)
        .single();

      if (!customer) throw new Error('Customer not found');

      // Determine review link
      const reviewPlatform = platform || business.default_review_platform || 'google';
      let reviewLink = '';
      
      if (reviewPlatform === 'google') {
        reviewLink = (business as any).google_review_link || '';
      } else if (reviewPlatform === 'yelp') {
        reviewLink = (business as any).yelp_review_link || '';
      } else if (reviewPlatform === 'facebook') {
        reviewLink = (business as any).facebook_review_link || '';
      }

      if (!reviewLink) {
        throw new Error('No review link configured for ' + reviewPlatform);
      }

      // Create review request
      const { data: request, error: insertError } = await supabase
        .from('review_requests')
        .insert({
          business_id: business.id,
          customer_id: customerId,
          quote_id: quoteId || null,
          platform: reviewPlatform,
          review_link: reviewLink,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Build message with merge fields replaced
      const messageTemplate = (business as any).review_request_message || 
        "Hi {{customer_first_name}}, thank you for choosing {{business_name}}! If you were happy with our service, we'd really appreciate a quick review: {{review_link}} - {{owner_first_name}}";
      
      const firstName = customer.name?.split(' ')[0] || customer.name || 'there';
      const ownerFirstName = business.owner_name?.split(' ')[0] || business.owner_name || '';
      
      const message = messageTemplate
        .replace(/\{\{customer_first_name\}\}/g, firstName)
        .replace(/\{\{customer_name\}\}/g, customer.name || '')
        .replace(/\{\{business_name\}\}/g, business.name || '')
        .replace(/\{\{owner_first_name\}\}/g, ownerFirstName)
        .replace(/\{\{owner_name\}\}/g, business.owner_name || '')
        .replace(/\{\{review_link\}\}/g, reviewLink);

      // Queue the message
      const scheduledFor = sendImmediately 
        ? new Date().toISOString()
        : new Date(Date.now() + ((business as any).review_request_delay_days || 1) * 24 * 60 * 60 * 1000).toISOString();

      await supabase
        .from('retention_queue')
        .insert({
          business_id: business.id,
          customer_id: customerId,
          quote_id: quoteId || null,
          sequence_id: null,
          step_index: 0,
          channel: 'sms',
          to_phone: customer.phone,
          from_phone: business.twilio_phone_number,
          content: message,
          scheduled_for: scheduledFor,
          trigger_type: 'review_request',
          metadata: {
            review_request_id: request.id,
            platform: reviewPlatform,
            review_link: reviewLink,
          },
        });

      await fetchRequests();
      return { data: request, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, [business, fetchRequests]);

  const markAsReviewed = useCallback(async (requestId: string, rating?: number) => {
    try {
      const { error } = await supabase
        .from('review_requests')
        .update({
          review_received: true,
          review_rating: rating,
          review_received_at: new Date().toISOString(),
          status: 'reviewed',
        })
        .eq('id', requestId);

      if (error) throw error;
      await fetchRequests();
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }, [fetchRequests]);

  return {
    requests,
    stats,
    loading,
    refetch: fetchRequests,
    sendReviewRequest,
    markAsReviewed,
  };
}
