'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User } from '@/types/login'
import { 
  Plus,
  RefreshCw
} from 'lucide-react'
import AdminSidebar from '@/app/components/AdminSidebar'
import ProductTypesTab from '@/app/components/ProductTypesTab'
import BrandsTab from '@/app/components/BrandsTab'
import ColorsTab from '@/app/components/ColorsTab'

export default function ProductsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('product-types')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [productTypeActive, setProductTypeActive] = useState(false)
  const [brandActive, setBrandActive] = useState(false)
  const [colorActive, setColorActive] = useState(false)
  const router = useRouter()
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/admin/products'

  useEffect(() => {
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

  const getSheetContent = () => {
    switch (activeTab) {
      case 'product-types':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-type-name">Product Type Name</Label>
              <Input id="product-type-name" placeholder="Enter product type name" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={productTypeActive}
                onCheckedChange={setProductTypeActive}
              />
              <Label>{productTypeActive ? 'Active' : 'Inactive'}</Label>
            </div>
          </div>
        )
      case 'brands':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input id="brand-name" placeholder="Enter brand name" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={brandActive}
                onCheckedChange={setBrandActive}
              />
              <Label>{brandActive ? 'Active' : 'Inactive'}</Label>
            </div>
          </div>
        )
      case 'colors':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="color-name">Color Name</Label>
              <Input id="color-name" placeholder="Enter color name" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={colorActive}
                onCheckedChange={setColorActive}
              />
              <Label>{colorActive ? 'Active' : 'Inactive'}</Label>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const getSheetTitle = () => {
    switch (activeTab) {
      case 'product-types':
        return 'Add New Product Type'
      case 'brands':
        return 'Add New Brand'
      case 'colors':
        return 'Add New Color'
      default:
        return 'Add New'
    }
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
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{getSheetTitle()}</SheetTitle>
                    <SheetDescription>
                      Add a new {activeTab.replace('-', ' ')} to the system.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6">
                    {getSheetContent()}
                  </div>
                  <SheetFooter>
                    <Button type="submit" onClick={() => setSheetOpen(false)}>
                      Save {activeTab.replace('-', ' ')}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="product-types" className="space-y-6" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="product-types">Product Types</TabsTrigger>
              <TabsTrigger value="brands">Brands</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
            </TabsList>

            {/* Product Types Tab */}
            <TabsContent value="product-types">
              <ProductTypesTab />
            </TabsContent>

            {/* Brands Tab */}
            <TabsContent value="brands">
              <BrandsTab />
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors">
              <ColorsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}