import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const redirectTo = requestUrl.searchParams.get('redirect') || '/'
  
  console.log('=== Server Auth Callback ===')
  console.log('Code present:', !!code)
  console.log('Error:', error)
  console.log('Redirect to:', redirectTo)
  
  // Get the origin for redirects
  const origin = requestUrl.origin
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorUrl = new URL('/login', origin)
    errorUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(errorUrl)
  }
  
  if (!code) {
    console.error('No code in callback')
    return NextResponse.redirect(new URL('/login?error=No+authorization+code', origin))
  }
  
  // Exchange code for session using server client with cookie access
  const cookieStore = await cookies()
  
  // Log available cookies for debugging
  const allCookies = cookieStore.getAll()
  console.log('Available cookies:', allCookies.map(c => c.name))
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )

  console.log('Attempting code exchange...')
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  
  if (exchangeError) {
    console.error('Code exchange error:', exchangeError.message)
    const errorUrl = new URL('/login', origin)
    errorUrl.searchParams.set('error', exchangeError.message)
    return NextResponse.redirect(errorUrl)
  }
  
  if (data.session) {
    console.log('Session established! Redirecting to:', redirectTo)
    return NextResponse.redirect(new URL(redirectTo, origin))
  }
  
  console.error('No session after exchange')
  return NextResponse.redirect(new URL('/login?error=No+session+created', origin))
}
