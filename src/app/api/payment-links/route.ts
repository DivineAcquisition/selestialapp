import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabase as supabaseAdmin } from '@/integrations/supabase/client';

// GET /api/payment-links
// List all payment links for the authenticated user's business
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's business
    const { data: business, error: bizError } = await (supabaseAdmin as any)
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (bizError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = (supabaseAdmin as any)
      .from('payment_links')
      .select('*', { count: 'exact' })
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching payment links:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment links' },
        { status: 500 }
      );
    }

    // Calculate stats
    const { data: allLinks } = await (supabaseAdmin as any)
      .from('payment_links')
      .select('status, amount')
      .eq('business_id', business.id);

    const stats = {
      total: allLinks?.length || 0,
      pending: allLinks?.filter((l: any) => l.status === 'pending').length || 0,
      paid: allLinks?.filter((l: any) => l.status === 'paid').length || 0,
      expired: allLinks?.filter((l: any) => l.status === 'expired').length || 0,
      cancelled: allLinks?.filter((l: any) => l.status === 'cancelled').length || 0,
      pendingAmount: allLinks
        ?.filter((l: any) => l.status === 'pending')
        .reduce((sum: number, l: any) => sum + l.amount, 0) || 0,
      paidAmount: allLinks
        ?.filter((l: any) => l.status === 'paid')
        .reduce((sum: number, l: any) => sum + l.amount, 0) || 0,
    };

    return NextResponse.json({
      data,
      count,
      stats,
    });
  } catch (error) {
    console.error('Payment links GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/payment-links
// Create a new payment link
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      amount,
      description,
      services,
      expiresInDays,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerEmail, amount' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get user's business
    const { data: business, error: bizError } = await (supabaseAdmin as any)
      .from('businesses')
      .select('id, name')
      .eq('owner_id', user.id)
      .single();

    if (bizError || !business) {
      return NextResponse.json(
        { error: 'Business not found. Please complete business setup first.' },
        { status: 404 }
      );
    }

    // Generate unique link ID
    const linkId = `pay_${nanoid(9)}`;

    // Calculate expiry date if provided
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create payment link
    const { data, error } = await (supabaseAdmin as any)
      .from('payment_links')
      .insert({
        link_id: linkId,
        business_id: business.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        amount: parseFloat(amount),
        description: description || null,
        services: services || [],
        status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment link:', error);
      return NextResponse.json(
        { error: 'Failed to create payment link' },
        { status: 500 }
      );
    }

    // Build payment URL
    const paymentUrl = `https://pay.selestial.com/${linkId}`;

    return NextResponse.json({
      data,
      paymentUrl,
      message: 'Payment link created successfully',
    });
  } catch (error) {
    console.error('Payment links POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
