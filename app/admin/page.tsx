'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { User } from '@/types/login'
import { 
  Menu,
  Users, 
  ShoppingBag,
  RefreshCw
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalOrders: number
      totalUsers: number
      revenue: number
      activeProducts: number
      totalBrands: number
      totalColors: number
      totalTypes: number
    }
    recentActivity: Array<{
      id: string
      type: 'order' | 'user' | 'product'
      title: string
      description: string
      timestamp: string
    }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      if (data.success) {
        setDashboardData(data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  useEffect(() => {
    // Check if user is authenticated and is admin
    const checkAuth = () => {
      const userRole = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_role='))
        ?.split('=')[1]

      const userName = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_name='))
        ?.split('=')[1]

      const userEmail = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_email='))
        ?.split('=')[1]

      const userId = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_id='))
        ?.split('=')[1]

      if (userRole !== 'admin') {
        router.push('/login')
        return
      }

      if (userName && userEmail && userId) {
        setUser({
          id: userId,
          name: userName,
          email: userEmail,
          role: userRole
        })
      }
    }

    checkAuth()
    fetchDashboardData()
  }, [router])

  const handleLogout = async () => {
    // Clear cookies by setting them to expire
    document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    router.push('/login')
  }

  if (!user || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        onNavigate={(href) => router.push(href)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <div></div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData?.stats.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData?.stats.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardData?.stats.activeProducts || 0}</div>
                <p className="text-xs text-muted-foreground">+5 new this week</p>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <div>
              <CardTitle className="mb-2">Recent Activity</CardTitle>
              <CardDescription className="mb-4">Latest actions in the system</CardDescription>
            </div>
            <div className="space-y-4">
              {dashboardData?.recentActivity.map((activity) => {
                const getActivityColor = (type: string) => {
                  switch (type) {
                    case 'order': return 'bg-blue-500'
                    case 'user': return 'bg-green-500'
                    case 'product': return 'bg-yellow-500'
                    default: return 'bg-gray-500'
                  }
                }
                
                const getTimeAgo = (timestamp: string) => {
                  const now = new Date()
                  const activityTime = new Date(timestamp)
                  const diffMs = now.getTime() - activityTime.getTime()
                  const diffMins = Math.floor(diffMs / 60000)
                  
                  if (diffMins < 60) {
                    return `${diffMins} min ago`
                  } else if (diffMins < 1440) {
                    return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''} ago`
                  } else {
                    return `${Math.floor(diffMins / 1440)} day${Math.floor(diffMins / 1440) > 1 ? 's' : ''} ago`
                  }
                }
                
                return (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
                  </div>
                )
              }) || (
                <div className="text-center text-gray-500 py-4">
                  No recent activity
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.3)] z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}