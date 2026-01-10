import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getTwilioClient, TWILIO_MESSAGING_SERVICE_SID, isTwilioConfigured } from '@/lib/twilio/client'

export async function POST(req: NextRequest) {
  try {
    const twilioClient = getTwilioClient()
    if (!isTwilioConfigured() || !twilioClient) {
      return NextResponse.json({ error: 'SMS not configured' }, { status: 503 })
    }

    const { to, message, quoteId } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, twilio_phone_number')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Send via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      to: to,
      messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
    })

    // If we have a quoteId, log message in database
    if (quoteId) {
      const { error: dbError } = await supabase
        .from('messages')
        .insert({
          business_id: business.id,
          quote_id: quoteId,
          channel: 'sms',
          from_address: business.twilio_phone_number || '',
          to_address: to,
          content: message,
          status: 'sent',
          external_id: twilioMessage.sid,
          sent_at: new Date().toISOString(),
        })

      if (dbError) {
        console.error('Failed to save message:', dbError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      twilioSid: twilioMessage.sid 
    })
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
