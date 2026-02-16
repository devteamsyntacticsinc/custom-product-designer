import { supabase } from '../supabase'
import { LoginCredentials, LoginResponse } from '@/types/login'
import bcrypt from 'bcryptjs'

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    // Get user with role information by joining the roles table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        roles (
          name
        )
      `)
      .eq('email', credentials.email)
      .single()

    if (userError || !user) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.roles?.name || 'user' // Use role name from joined table, fallback to 'user'
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Login failed. Please try again.'
    }
  }
}