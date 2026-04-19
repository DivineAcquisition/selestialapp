import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// =============================================================================
// SELESTIAL MULTI-DOMAIN ARCHITECTURE
// =============================================================================
// Domain                  | Purpose                    | Auth Required
// ------------------------|----------------------------|---------------
// app.selestial.io        | Main SaaS application      | Yes
// docs.selestial.io       | Documentation & guides     | No
// access.selestial.io     | Marketing, beta signup     | No
// book.selestial.io       | Customer booking widget    | No
// paylink.selestial.io    | Payment link pages         | No
// =============================================================================

// Auth routes - redirect to dashboard if already logged in  
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification']

// Routes that require authentication (app.selestial.io)
const protectedPrefixes = [
  '/inbox', '/quotes', '/customers', '/sequences', '/retention', 
  '/campaigns', '/analytics', '/connections', '/billing', '/settings', 
  '/onboarding', '/launch-checklist', '/admin', '/bookings', '/payments', '/pricing'
]

// Public routes within app domain (no auth required)
const appPublicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification', '/auth/callback']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain
  // Handle: "docs.selestial.io", "app.selestial.io", "localhost:3000"
  const hostParts = hostname.split('.')
  let subdomain: string | null = null
  
  if (hostname.includes('selestial.io')) {
    // Production: extract subdomain from selestial.io
    subdomain = hostParts.length > 2 ? hostParts[0] : 'app'
  } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Development: check for subdomain parameter or default to app
    const subdomainParam = request.nextUrl.searchParams.get('subdomain')
    subdomain = subdomainParam || 'app'
  } else {
    // Other environments (Vercel preview, etc.)
    subdomain = hostParts.length > 2 ? hostParts[0] : 'app'
  }

  // ==========================================================================
  // SUBDOMAIN ROUTING
  // ==========================================================================

  // docs.selestial.io - Documentation (PUBLIC)
  if (subdomain === 'docs') {
    const newPath = pathname === '/' ? '/docs' : `/docs${pathname}`
    return NextResponse.rewrite(new URL(newPath, request.url))
  }

  // access.selestial.io - Marketing landing pages (PUBLIC)
  if (subdomain === 'access') {
    // Public marketing routes that should pass through unchanged.
    const accessAllowedPrefixes = ['/welcome', '/demo', '/api/booking-page-customization']
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/welcome', request.url))
    }
    if (accessAllowedPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.rewrite(new URL(pathname, request.url))
    }
    // Anything else on access.* (auth pages, dashboard, etc.) → 404 to /welcome
    return NextResponse.rewrite(new URL('/welcome', request.url))
  }

  // book.selestial.io - Customer booking widget (PUBLIC)
  if (subdomain === 'book') {
    const newPath = pathname === '/' ? '/book' : `/book${pathname}`
    return NextResponse.rewrite(new URL(newPath, request.url))
  }

  // paylink.selestial.io - Payment links (PUBLIC)
  if (subdomain === 'paylink') {
    const newPath = pathname === '/' ? '/pay' : `/pay${pathname}`
    return NextResponse.rewrite(new URL(newPath, request.url))
  }

  // ==========================================================================
  // app.selestial.io - Main Application (AUTHENTICATED)
  // ==========================================================================

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

  // Check if it's a public route within app domain
  const isAppPublicRoute = appPublicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Check if it's an auth route
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Check if it's a protected route
  const isProtectedRoute = protectedPrefixes.some(prefix => 
    pathname === prefix || pathname.startsWith(prefix + '/')
  )

  // Root path (/) handling for app.selestial.io:
  // - If logged in: show dashboard
  // - If not logged in: redirect to login
  if (pathname === '/') {
    if (session) {
      return response
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Public routes within app are always accessible
  if (isAppPublicRoute) {
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
