'use client'

import { SessionProvider } from 'next-auth/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ToastProvider } from '@/contexts/ToastContext'
import { AdminThemeProvider } from './providers/AdminThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider>
        <ToastProvider>
          <AdminThemeProvider>
            {children}
          </AdminThemeProvider>
        </ToastProvider>
      </TooltipProvider>
    </SessionProvider>
  )
}
