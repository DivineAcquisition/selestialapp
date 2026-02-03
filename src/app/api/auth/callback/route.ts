import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const redirectTo = requestUrl.searchParams.get('redirect') || requestUrl.searchParams.get('next') || '/'
  
  // Get the origin for redirects
  const origin = requestUrl.origin
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorUrl = new URL('/login', origin)
    errorUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(errorUrl)
  }
  
  // Handle OAuth code exchange
  if (code) {
    const cookieStore = await cookies()
    
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
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
              console.error('Error setting cookies:', error)
            }
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      const errorUrl = new URL('/login', origin)
      errorUrl.searchParams.set('error', exchangeError.message)
      return NextResponse.redirect(errorUrl)
    }
    
    // Successful auth - redirect to the intended destination
    const successUrl = new URL(redirectTo, origin)
    return NextResponse.redirect(successUrl)
  }
  
  // No code - redirect to login
  return NextResponse.redirect(new URL('/login', origin))
}
