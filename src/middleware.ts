import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase is not configured (build time)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
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

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Auth callback route
  if (pathname.startsWith('/auth/callback')) {
    return response
  }

  // Protected dashboard routes - redirect to login if no session
  const protectedRoutes = ['/', '/inbox', '/quotes', '/customers', '/sequences', '/retention', '/campaigns', '/analytics', '/connections', '/billing', '/settings', '/onboarding', '/launch-checklist', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in users away from auth pages
  if (isPublicRoute && session) {
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
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
