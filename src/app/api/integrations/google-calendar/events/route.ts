import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabase as supabaseAdmin } from '@/integrations/supabase/client';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  status: string;
  htmlLink?: string;
}

interface GoogleCalendarListResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed');
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business
    const { data: business } = await (supabaseAdmin as any)
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    // Get Google Calendar connection
    const { data: connection } = await (supabaseAdmin as any)
      .from('integration_connections')
      .select('*')
      .eq('business_id', business.id)
      .eq('integration_type', 'google_calendar')
      .eq('is_active', true)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 404 });
    }

    let accessToken = connection.access_token;

    // Check if token is expired
    const tokenExpiresAt = new Date(connection.token_expires_at);
    if (tokenExpiresAt < new Date()) {
      // Refresh the token
      if (!connection.refresh_token) {
        return NextResponse.json({ error: 'No refresh token available' }, { status: 401 });
      }

      const newTokens = await refreshAccessToken(connection.refresh_token);
      if (!newTokens) {
        // Deactivate the connection
        await (supabaseAdmin as any)
          .from('integration_connections')
          .update({ is_active: false })
          .eq('id', connection.id);
        return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
      }

      accessToken = newTokens.access_token;

      // Update stored tokens
      await (supabaseAdmin as any)
        .from('integration_connections')
        .update({
          access_token: newTokens.access_token,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq('id', connection.id);
    }

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch events from Google Calendar
    const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    calendarUrl.searchParams.set('timeMin', timeMin);
    calendarUrl.searchParams.set('timeMax', timeMax);
    calendarUrl.searchParams.set('singleEvents', 'true');
    calendarUrl.searchParams.set('orderBy', 'startTime');
    calendarUrl.searchParams.set('maxResults', '100');

    const eventsResponse = await fetch(calendarUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text();
      console.error('Failed to fetch events:', errorText);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    const eventsData: GoogleCalendarListResponse = await eventsResponse.json();

    // Transform events to our format
    const events = eventsData.items
      .filter(event => event.status !== 'cancelled')
      .map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        location: event.location,
        type: 'google' as const,
        googleEventId: event.id,
        link: event.htmlLink,
      }));

    return NextResponse.json({ 
      events,
      account: {
        email: connection.account_email,
        name: connection.account_name,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Google Calendar events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// Create a new event on Google Calendar
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { summary, description, start, end, location } = body;

    if (!summary || !start || !end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get business
    const { data: business } = await (supabaseAdmin as any)
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    // Get Google Calendar connection
    const { data: connection } = await (supabaseAdmin as any)
      .from('integration_connections')
      .select('*')
      .eq('business_id', business.id)
      .eq('integration_type', 'google_calendar')
      .eq('is_active', true)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 404 });
    }

    let accessToken = connection.access_token;

    // Check if token is expired and refresh if needed
    const tokenExpiresAt = new Date(connection.token_expires_at);
    if (tokenExpiresAt < new Date() && connection.refresh_token) {
      const newTokens = await refreshAccessToken(connection.refresh_token);
      if (newTokens) {
        accessToken = newTokens.access_token;
        await (supabaseAdmin as any)
          .from('integration_connections')
          .update({
            access_token: newTokens.access_token,
            token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          })
          .eq('id', connection.id);
      }
    }

    // Create event on Google Calendar
    const eventData = {
      summary,
      description,
      start: { dateTime: start, timeZone: 'America/New_York' },
      end: { dateTime: end, timeZone: 'America/New_York' },
      location,
    };

    const createResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create event:', errorText);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    const createdEvent = await createResponse.json();

    return NextResponse.json({
      event: {
        id: createdEvent.id,
        title: createdEvent.summary,
        start: createdEvent.start.dateTime,
        end: createdEvent.end.dateTime,
        location: createdEvent.location,
        type: 'google',
        googleEventId: createdEvent.id,
        link: createdEvent.htmlLink,
      },
    });
  } catch (error) {
    console.error('Create Google Calendar event error:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
