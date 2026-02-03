import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabase as supabaseAdmin } from '@/integrations/supabase/client';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`
  : 'http://localhost:3000/api/integrations/google-calendar/callback';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      new URL('/connections?error=google_auth_failed', request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/connections?error=missing_params', request.url)
    );
  }

  try {
    // Decode state
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    const userId = stateData.userId;

    // Validate state timestamp (5 minute window)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/connections?error=state_expired', request.url)
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/connections?error=token_exchange_failed', request.url)
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info');
      return NextResponse.redirect(
        new URL('/connections?error=user_info_failed', request.url)
      );
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // Store the connection in database
    const supabase = await createServerSupabaseClient();

    // Verify user matches state
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.redirect(
        new URL('/connections?error=user_mismatch', request.url)
      );
    }

    // Get business for this user
    const { data: business } = await (supabaseAdmin as any)
      .from('businesses')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!business) {
      return NextResponse.redirect(
        new URL('/connections?error=no_business', request.url)
      );
    }

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Upsert the integration connection
    const { error: upsertError } = await (supabaseAdmin as any)
      .from('integration_connections')
      .upsert({
        business_id: business.id,
        integration_type: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: expiresAt,
        account_email: userInfo.email,
        account_name: userInfo.name,
        account_id: userInfo.id,
        is_active: true,
        connected_at: new Date().toISOString(),
        metadata: {
          picture: userInfo.picture,
          scopes: tokens.scope,
        },
      }, {
        onConflict: 'business_id,integration_type',
      });

    if (upsertError) {
      console.error('Failed to save integration:', upsertError);
      return NextResponse.redirect(
        new URL('/connections?error=save_failed', request.url)
      );
    }

    // Success! Redirect back to connections page
    return NextResponse.redirect(
      new URL('/connections?success=google_calendar_connected', request.url)
    );
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(
      new URL('/connections?error=callback_failed', request.url)
    );
  }
}
