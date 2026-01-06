import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Marketing/public routes - always accessible
const publicRoutes = ['/home', '/pricing', '/features', '/about', '/terms', '/privacy']

// Auth routes - redirect to dashboard if already logged in  
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification']

// Routes that require authentication
const protectedPrefixes = ['/inbox', '/quotes', '/customers', '/sequences', '/retention', '/campaigns', '/analytics', '/connections', '/billing', '/settings', '/onboarding', '/launch-checklist', '/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware if Supabase is not configured (build time)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url') {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if exists
  const { data: { session } } = await supabase.auth.getSession()

  // Auth callback route - always allow
  if (pathname.startsWith('/auth/callback')) {
    return response
  }

  // Check if it's a public marketing route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Check if it's an auth route
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Check if it's a protected route
  const isProtectedRoute = protectedPrefixes.some(prefix => 
    pathname === prefix || pathname.startsWith(prefix + '/')
  )

  // Root path (/) handling:
  // - If logged in: show dashboard (protected)
  // - If not logged in: redirect to marketing landing page
  if (pathname === '/') {
    if (session) {
      // User is logged in - the dashboard page will handle this
      return response
    } else {
      // User is not logged in - redirect to marketing landing page
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  // Public routes are always accessible
  if (isPublicRoute) {
    return response
  }

  // Protected routes - redirect to login if no session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth routes - redirect to dashboard if already logged in
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
