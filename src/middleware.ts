import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Marketing/public routes - always accessible
const publicRoutes = ['/welcome', '/docs', '/book', '/embed', '/pay']

// Auth routes - redirect to dashboard if already logged in  
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification']

// Routes that require authentication
const protectedPrefixes = ['/inbox', '/quotes', '/customers', '/sequences', '/retention', '/campaigns', '/analytics', '/connections', '/billing', '/settings', '/onboarding', '/launch-checklist', '/admin', '/bookings', '/payments', '/pricing']

// Subdomain configuration
const SUBDOMAIN_ROUTES: Record<string, string> = {
  'docs': '/docs',
  'access': '/welcome',
  'book': '/book',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain (e.g., "docs" from "docs.selestial.io")
  const subdomain = hostname.split('.')[0]
  
  // Handle subdomain routing
  if (SUBDOMAIN_ROUTES[subdomain] && !pathname.startsWith(SUBDOMAIN_ROUTES[subdomain])) {
    // Rewrite to the appropriate path for the subdomain
    const targetPath = SUBDOMAIN_ROUTES[subdomain]
    
    // For docs subdomain, allow any path under /docs
    if (subdomain === 'docs') {
      const newPath = pathname === '/' ? '/docs' : `/docs${pathname}`
      return NextResponse.rewrite(new URL(newPath, request.url))
    }
    
    // For access subdomain, rewrite to /welcome
    if (subdomain === 'access') {
      return NextResponse.rewrite(new URL('/welcome', request.url))
    }
    
    // For book subdomain, allow booking paths
    if (subdomain === 'book') {
      const newPath = pathname === '/' ? '/book' : `/book${pathname}`
      return NextResponse.rewrite(new URL(newPath, request.url))
    }
  }

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
  // - If not logged in: redirect to login
  if (pathname === '/') {
    if (session) {
      // User is logged in - the dashboard page will handle this
      return response
    } else {
      // User is not logged in - redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
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
