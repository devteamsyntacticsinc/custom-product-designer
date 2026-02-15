'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types/login'
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Settings, 
  LogOut,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

interface AdminSidebarProps {
  user: User
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onLogout: () => void
  onNavigate: (href: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function AdminSidebar({ 
  user, 
  sidebarOpen, 
  setSidebarOpen, 
  onLogout,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse
}: AdminSidebarProps) {
  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b">
        {!isCollapsed && <h1 className="text-xl font-bold text-gray-900">Print Pro Admin</h1>}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className={`${isCollapsed ? 'px-2' : 'px-4'} space-y-2`}>
          {sidebarItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'}`}
              onClick={() => onNavigate(item.href)}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`${isCollapsed ? '' : 'mr-3'} h-4 w-4`} />
              {!isCollapsed && item.label}
            </Button>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        {!isCollapsed && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <Badge variant="secondary" className="mt-1">Admin</Badge>
          </div>
        )}
        <Button
          variant="outline"
          className={`w-full ${isCollapsed ? 'justify-center' : ''}`}
          onClick={onLogout}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`} />
          {!isCollapsed && 'Logout'}
        </Button>
      </div>
    </div>
  )
}
