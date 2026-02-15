'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types/login'
import { OrderWithCustomer } from '@/types/order'
import { 
  Menu,
  ArrowLeft,
  User as UserIcon,
  Mail,
  Package,
  RefreshCw
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import OrdersPageSkeleton from '../../../components/OrdersPageSkeleton'
import OrderProductPreview from '../../../components/OrderProductPreview'

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [orders, setOrders] = useState<OrderWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/admin/orders'

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
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
    fetchOrders()
  }, [router])

  const handleLogout = async () => {
    // Clear cookies by setting them to expire
    document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    router.push('/login')
  }

  const handleNavigate = (href: string) => {
    router.push(href)
  }

  const getCustomerInfo = (customers: OrderWithCustomer['customers']) => {
    if (Array.isArray(customers)) {
      return customers[0] || null
    }
    return customers
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalQuantity = (order: OrderWithCustomer) => {
    return order.product_sizes?.reduce((total, size) => total + (size.quantity || 0), 0) || 0
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar
          user={null}
          sidebarOpen={false}
          setSidebarOpen={() => {}}
          onLogout={() => {}}
          onNavigate={() => {}}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          currentPath="/admin/orders"
        />
        <div className="flex-1 lg:ml-64">
          <OrdersPageSkeleton />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          currentPath={currentPath}
        />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <OrdersPageSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPath={currentPath}
      />
      
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b lg:hidden fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Orders</h1>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} lg:pt-0 pt-16`}>        
        {/* Orders Content */}
        <main className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600">Manage all customer orders</p>
              </div>
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

          {/* Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">When customers place orders, they will appear here.</p>
              </Card>
            ) : (
              orders.map((order) => {
                const customer = getCustomerInfo(order.customers)
                const totalQuantity = getTotalQuantity(order)
                
                return (
                  <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="space-y-6">
                      {/* Product Preview */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Design</h3>
                        <OrderProductPreview order={order} />
                      </div>

                      {/* Order Details */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              #{order.id.toString().slice(-6)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {totalQuantity} items
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {order.brand_type?.[0]?.product_types?.[0]?.name && (
                              <span>{order.brand_type[0].product_types[0].name}</span>
                            )}
                            {order.brand_type?.[0]?.brands?.[0]?.name && (
                              <span>• {order.brand_type[0].brands[0].name}</span>
                            )}
                            {order.colors?.[0]?.value && (
                              <span>• {order.colors[0].value}</span>
                            )}
                          </div>

                          {/* Sizes */}
                          {order.product_sizes && order.product_sizes.length > 0 && (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">Sizes:</span>
                              {order.product_sizes.map((size) => (
                                <Badge key={size.id} variant="outline" className="text-xs">
                                  {size.sizes?.value || 'Unknown'} ({size.quantity})
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Customer Info */}
                        <div className="text-right shrink-0">
                          {customer ? (
                            <>
                              <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                                <UserIcon className="h-4 w-4" />
                                {customer.name}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">Customer info unavailable</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
