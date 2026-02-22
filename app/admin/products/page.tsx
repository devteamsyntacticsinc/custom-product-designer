"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/login";
import { RefreshCw, Menu, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AdminSidebar from "@/app/components/AdminSidebar";
import ProductTypesTab from "@/app/components/ProductTypesTab";
import BrandsTab from "@/app/components/BrandsTab";
import ColorsTab from "@/app/components/ColorsTab";
import SizesTab from "@/app/components/SizesTab";
import ProductBrandSizesTable from "@/app/components/ProductBrandSizesTable";

export default function ProductsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const currentPath =
    typeof window !== "undefined"
      ? window.location.pathname
      : "/admin/products";

  const [refetchSize, setRefetchSize] = useState<number>(Date.now());
  const [activeTab, setActiveTab] = useState("product-types");
  const isMoreActive = ["sizes"].includes(activeTab);

  useEffect(() => {
    const checkAuth = () => {
      const userRole = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_role="))
        ?.split("=")[1];

      const userName = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_name="))
        ?.split("=")[1];

      const userEmail = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_email="))
        ?.split("=")[1];

      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_id="))
        ?.split("=")[1];

      if (userRole !== "admin") {
        router.push("/login");
        return;
      }

      if (userName && userEmail && userId) {
        setUser({
          id: userId,
          name: userName,
          email: userEmail,
          role: userRole,
        });
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    // Clear cookies by setting them to expire
    document.cookie =
      "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    router.push("/login");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar
          user={null}
          sidebarOpen={false}
          setSidebarOpen={() => { }}
          onLogout={() => { }}
          onNavigate={() => { }}
          isCollapsed={false}
          onToggleCollapse={() => { }}
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
    );
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

      <header className="bg-white shadow-sm border-b lg:hidden fixed top-0 left-0 right-0 z-40 px-4">
        <div className="relative flex items-center justify-center h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">Print Pro</h1>
        </div>
      </header>

      <div
        className={`flex-1 w-full overflow-x-hidden min-w-0 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"} lg:pt-0 pt-16`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-xs lg:text-base text-gray-600 mt-1 sm:mt-2">
                Manage product types, brands, and colors
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10 text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full flex h-9 p-1 bg-gray-100 rounded-lg lg:grid lg:grid-cols-4 lg:h-10">
              {/* First 3 tabs: Always visible */}
              <TabsTrigger
                value="product-types"
                className="flex-1 text-[10px] sm:text-xs lg:text-sm px-1 sm:px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Product Types
              </TabsTrigger>
              <TabsTrigger
                value="brands"
                className="flex-1 text-[10px] sm:text-xs lg:text-sm px-1 sm:px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Brands
              </TabsTrigger>
              <TabsTrigger
                value="colors"
                className="flex-1 text-[10px] sm:text-xs lg:text-sm px-1 sm:px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Colors
              </TabsTrigger>

              {/* Sizes Tab: Visible on desktop, in dropdown on mobile */}
              <TabsTrigger
                value="sizes"
                className="hidden lg:flex flex-1 text-sm px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Sizes
              </TabsTrigger>

              {/* Mobile "More" Dropdown */}
              <div className="lg:hidden flex items-center px-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-md transition-colors ${isMoreActive ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1 flex flex-col gap-1" align="end">
                    <TabsTrigger
                      value="sizes"
                      className="w-full justify-start text-xs sm:text-sm px-2 py-1.5 data-[state=active]:bg-gray-100"
                    >
                      Sizes
                    </TabsTrigger>
                    {/* Add more overflow tabs here in the future */}
                  </PopoverContent>
                </Popover>
              </div>
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
            {/* Sizes Tab */}
            <TabsContent value="sizes" className="space-y-6">
              <SizesTab setRefetchSize={setRefetchSize} />
              <ProductBrandSizesTable refetchSize={refetchSize} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
