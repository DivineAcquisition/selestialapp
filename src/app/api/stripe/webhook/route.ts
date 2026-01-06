import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Handle quote payment (has quote_id in metadata from payment link)
        if (session.metadata?.quote_id) {
          const quoteId = session.metadata.quote_id
          const businessId = session.metadata.business_id

          // Update quote as paid
          await supabaseAdmin
            .from('quotes')
            .update({
              payment_status: 'paid',
              status: 'won',
              paid_at: new Date().toISOString(),
              won_at: new Date().toISOString(),
            })
            .eq('id', quoteId)

          // Update payment link status
          if (session.payment_link) {
            const paymentLinkId = typeof session.payment_link === 'string' 
              ? session.payment_link 
              : session.payment_link.id
            await supabaseAdmin
              .from('payment_links')
              .update({ status: 'paid' })
              .eq('stripe_payment_link_id', paymentLinkId)
          }

          // Create payment record
          const amount = session.amount_total || 0
          const platformFee = Math.round(amount * 0.03)
          
          // Get business stripe account id
          const { data: businessData } = await supabaseAdmin
            .from('businesses')
            .select('stripe_connect_account_id')
            .eq('id', businessId)
            .single()
          
          if (businessData?.stripe_connect_account_id) {
            await supabaseAdmin
              .from('payments')
              .insert({
                business_id: businessId,
                quote_id: quoteId,
                amount: amount,
                platform_fee: platformFee,
                net_amount: amount - platformFee,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string,
                stripe_account_id: businessData.stripe_connect_account_id,
                status: 'succeeded',
                customer_email: session.customer_email || session.customer_details?.email,
              })
          }

          // Send notification email to business
          if (businessId) {
            const { data: business } = await supabaseAdmin
              .from('businesses')
              .select('email, name')
              .eq('id', businessId)
              .single()

            if (business?.email) {
              try {
                await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/payment-received`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: business.email,
                    businessName: business.name,
                    amount: amount,
                    customerEmail: session.customer_email || session.customer_details?.email,
                  }),
                })
              } catch (emailError) {
                console.error('Failed to send payment notification:', emailError)
              }
            }
          }
          
          break
        }

        // Handle subscription checkout (existing logic)
        const userId = session.metadata?.user_id
        const subscriptionId = session.subscription as string

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0].price.id

          // Determine tier based on price
          let tier = 'starter'
          if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) tier = 'growth'
          if (priceId === process.env.STRIPE_SCALE_PRICE_ID) tier = 'scale'

          await supabaseAdmin
            .from('businesses')
            .update({
              subscription_status: 'active',
              subscription_tier: tier,
              stripe_subscription_id: subscriptionId,
            })
            .eq('user_id', userId)
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        
        if (account.metadata?.business_id) {
          const isComplete = account.charges_enabled && account.payouts_enabled
          
          await supabaseAdmin
            .from('businesses')
            .update({
              stripe_connect_enabled: isComplete,
            })
            .eq('id', account.metadata.business_id)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: business } = await supabaseAdmin
          .from('businesses')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (business) {
          const priceId = subscription.items.data[0].price.id
          let tier = 'starter'
          if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) tier = 'growth'
          if (priceId === process.env.STRIPE_SCALE_PRICE_ID) tier = 'scale'

          await supabaseAdmin
            .from('businesses')
            .update({
              subscription_status: subscription.status,
              subscription_tier: tier,
            })
            .eq('id', business.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabaseAdmin
          .from('businesses')
          .update({
            subscription_status: 'canceled',
            subscription_tier: 'free',
          })
          .eq('stripe_customer_id', customerId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
