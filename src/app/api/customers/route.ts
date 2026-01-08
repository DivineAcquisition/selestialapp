import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/customers - List customers with filters
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Parse query params
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    
    if (status && status !== 'all') {
      // Map status filter to conditions
      if (status === 'active') {
        query = query.gte('health_score', 70)
      } else if (status === 'at_risk') {
        query = query.gte('health_score', 40).lt('health_score', 70)
      } else if (status === 'churned') {
        query = query.lt('health_score', 40)
      }
    }
    
    if (type && type !== 'all') {
      query = query.eq('customer_type', type)
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data: customers, count, error } = await query
    
    if (error) {
      console.error('Fetch customers error:', error)
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }
    
    // Calculate stats
    const { data: allCustomers } = await supabase
      .from('customers')
      .select('health_score, customer_type, last_service_at')
      .eq('business_id', business.id)
    
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const stats = {
      total: allCustomers?.length || 0,
      recurring: allCustomers?.filter(c => c.customer_type === 'recurring').length || 0,
      atRisk: allCustomers?.filter(c => {
        const score = c.health_score ?? 100
        return score >= 40 && score < 70
      }).length || 0,
      dormant: allCustomers?.filter(c => {
        if (!c.last_service_at) return true
        return new Date(c.last_service_at) < thirtyDaysAgo
      }).length || 0,
    }
    
    return NextResponse.json({
      customers: customers || [],
      count,
      stats,
    })
  } catch (error) {
    console.error('Customers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/customers - Create a new customer
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    const body = await req.json()
    
    // Validate required fields
    if (!body.first_name?.trim()) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }
    
    if (!body.phone && !body.email) {
      return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 })
    }
    
    // Format phone if provided
    let formattedPhone = null
    if (body.phone) {
      const phoneDigits = body.phone.replace(/\D/g, '')
      if (phoneDigits.length === 10) {
        formattedPhone = `+1${phoneDigits}`
      } else if (phoneDigits.length === 11 && phoneDigits.startsWith('1')) {
        formattedPhone = `+${phoneDigits}`
      } else {
        formattedPhone = body.phone
      }
    }
    
    // Check for duplicates
    if (formattedPhone) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('business_id', business.id)
        .eq('phone', formattedPhone)
        .single()
      
      if (existing) {
        return NextResponse.json({ error: 'Customer with this phone already exists' }, { status: 409 })
      }
    }
    
    if (body.email) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('business_id', business.id)
        .eq('email', body.email.toLowerCase())
        .single()
      
      if (existing) {
        return NextResponse.json({ error: 'Customer with this email already exists' }, { status: 409 })
      }
    }
    
    // Create customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        business_id: business.id,
        name: `${body.first_name.trim()} ${body.last_name?.trim() || ''}`.trim(),
        phone: formattedPhone,
        email: body.email?.toLowerCase(),
        address: body.address_line1 ? [body.address_line1, body.city, body.state, body.zip_code].filter(Boolean).join(', ') : null,
        source: body.source || 'manual',
        notes: body.notes,
        customer_type: 'one_time',
        health_score: 100,
        total_spent: 0,
        total_jobs: 0,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Create customer error:', error)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }
    
    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Create customer API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
