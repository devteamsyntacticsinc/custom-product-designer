import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/api/login'
import { LoginCredentials } from '@/types/login'

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json()
    
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await loginUser(body)

    if (result.success) {
      // Create a simple session using cookies
      const response = NextResponse.json({
        success: true,
        user: result.user
      })

      // Set user info in cookies for session management
      response.cookies.set('user_id', result.user!.id)
      response.cookies.set('user_name', result.user!.name)
      response.cookies.set('user_email', result.user!.email)
      response.cookies.set('user_role', result.user!.role)

      return response
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
