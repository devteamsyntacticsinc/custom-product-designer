import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/admin']
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    const userRole = request.cookies.get('user_role')?.value
    
    // If no user role or not admin, redirect to login
    if (!userRole || userRole !== 'admin') {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If user is already logged in and tries to access login page, redirect appropriately
  if (pathname === '/login') {
    const userRole = request.cookies.get('user_role')?.value
    
    if (userRole) {
      if (userRole === 'admin') {
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
