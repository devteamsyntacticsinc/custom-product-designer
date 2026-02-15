'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User } from '@/types/login'
import { 
  Plus,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react'
import AdminSidebar from '@/app/components/AdminSidebar'

// Dummy data
const productTypes = [
  { id: 1, name: 'T-Shirt', description: 'Classic cotton t-shirt', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Hoodie', description: 'Warm fleece hoodie', status: 'active', createdAt: '2024-01-16' },
  { id: 3, name: 'Mug', description: 'Ceramic coffee mug', status: 'active', createdAt: '2024-01-17' },
  { id: 4, name: 'Cap', description: 'Adjustable baseball cap', status: 'inactive', createdAt: '2024-01-18' },
  { id: 5, name: 'Phone Case', description: 'Protective phone cover', status: 'active', createdAt: '2024-01-19' },
]

const brands = [
  { id: 1, name: 'Nike', description: 'Sportswear brand', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Adidas', description: 'German sportswear company', status: 'active', createdAt: '2024-01-16' },
  { id: 3, name: 'Puma', description: 'Athletic footwear and apparel', status: 'active', createdAt: '2024-01-17' },
  { id: 4, name: 'Under Armour', description: 'Sports performance brand', status: 'inactive', createdAt: '2024-01-18' },
  { id: 5, name: 'New Balance', description: 'Footwear and apparel brand', status: 'active', createdAt: '2024-01-19' },
]

const colors = [
  { id: 1, name: 'Black', hexCode: '#000000', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'White', hexCode: '#FFFFFF', status: 'active', createdAt: '2024-01-16' },
  { id: 3, name: 'Red', hexCode: '#FF0000', status: 'active', createdAt: '2024-01-17' },
  { id: 4, name: 'Blue', hexCode: '#0000FF', status: 'active', createdAt: '2024-01-18' },
  { id: 5, name: 'Green', hexCode: '#00FF00', status: 'inactive', createdAt: '2024-01-19' },
  { id: 6, name: 'Yellow', hexCode: '#FFFF00', status: 'active', createdAt: '2024-01-20' },
]

export default function ProductsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/admin/products'

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
  }, [router])

  const handleLogout = async () => {
    // Clear cookies by setting them to expire
    document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    router.push('/login')
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
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
          currentPath="/admin/products"
        />
        <div className="flex-1 lg:ml-64">
          <div className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
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
        onNavigate={(href: string) => router.push(href)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPath={currentPath}
      />
      
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-2">Manage product types, brands, and colors</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="product-types" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="product-types">Product Types</TabsTrigger>
              <TabsTrigger value="brands">Brands</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
            </TabsList>

            {/* Product Types Tab */}
            <TabsContent value="product-types">
              <Card>
                <CardHeader className= "py-6">
                  <CardTitle>Product Types</CardTitle>
                  <CardDescription>Manage different types of products available in your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>{type.id}</TableCell>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell>
                            <Badge variant={type.status === 'active' ? 'default' : 'secondary'}>
                              {type.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{type.createdAt}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Brands Tab */}
            <TabsContent value="brands">
              <Card>
                <CardHeader className="py-6">
                  <CardTitle>Brands</CardTitle>
                  <CardDescription>Manage product brands available in your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell>{brand.id}</TableCell>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell>
                            <Badge variant={brand.status === 'active' ? 'default' : 'secondary'}>
                              {brand.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{brand.createdAt}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors">
              <Card>
                <CardHeader className="py-6">
                  <CardTitle>Colors</CardTitle>
                  <CardDescription>Manage product colors available in your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colors.map((color) => (
                        <TableRow key={color.id}>
                          <TableCell>{color.id}</TableCell>
                          <TableCell className="font-medium">{color.name}</TableCell>
                          <TableCell>
                            <Badge variant={color.status === 'active' ? 'default' : 'secondary'}>
                              {color.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{color.createdAt}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}