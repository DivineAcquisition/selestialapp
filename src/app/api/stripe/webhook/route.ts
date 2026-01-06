import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
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
