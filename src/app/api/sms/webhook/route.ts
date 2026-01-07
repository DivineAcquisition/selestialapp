import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const formData = await req.formData()
    
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const body = formData.get('Body') as string
    const messageSid = formData.get('MessageSid') as string

    if (!from || !to || !body) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Find business by phone number
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('twilio_phone_number', to)
      .single()

    if (!business) {
      console.error('No business found for phone:', to)
      return new NextResponse(
        new twilio.twiml.MessagingResponse().toString(),
        { headers: { 'Content-Type': 'text/xml' } }
      )
    }

    // Find the most recent quote for this customer phone
    const { data: quote } = await supabaseAdmin
      .from('quotes')
      .select('id')
      .eq('business_id', business.id)
      .eq('customer_phone', from)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Save inbound message
    await supabaseAdmin
      .from('inbound_messages')
      .insert({
        business_id: business.id,
        quote_id: quote?.id || null,
        from_phone: from,
        to_phone: to,
        content: body,
        external_id: messageSid,
      })

    // Return empty TwiML response
    const response = new twilio.twiml.MessagingResponse()
    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('SMS webhook error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
