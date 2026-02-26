import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get session using NextAuth
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === 'admin'

  // Protected routes that require authentication
  const protectedRoutes = ['/admin']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // If no session or not admin, redirect to login
    if (!isLoggedIn || !isAdmin) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If user is already logged in and tries to access login page, redirect appropriately
  if (pathname === '/login') {
    if (isLoggedIn) {
      if (isAdmin) {
        const adminUrl = new URL('/admin', request.url)
        return NextResponse.redirect(adminUrl)
      } else {
        const homeUrl = new URL('/', request.url)
        return NextResponse.redirect(homeUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login']
}
