'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.ok) {
        // Get session to check user role
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        if (session?.user?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Login page error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md border-none shadow-none sm:border sm:shadow-lg bg-transparent sm:bg-white">
        <CardHeader className="space-y-2 p-6 sm:p-8">
          <CardTitle className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight text-gray-900">
            Print Pro
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base text-gray-500">
            Welcome back! Please enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0 sm:pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pr-12 h-10 lg:h-10 border-gray-300 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-12 h-10 lg:h-10 border-gray-300 focus:ring-primary focus:border-primary transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 text-xs sm:text-sm p-3 rounded-md text-center font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-base font-semibold transition-all hover:opacity-95 active:scale-[0.98] mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}