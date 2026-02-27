"use client";

import { useState, useEffect, Suspense, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Menu, MoreHorizontal, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AdminSidebar from "@/app/components/AdminSidebar";
import ProductTypesTab from "@/app/components/ProductTypesTab";
import BrandsTab from "@/app/components/BrandsTab";
import ColorsTab from "@/app/components/ColorsTab";
import SizesTab from "@/app/components/SizesTab";
import ProductBrandSizesTable from "@/app/components/ProductBrandSizesTable";
import ProductBrandColorTable from "@/app/components/ProductBrandColorTable";

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme") as
      | "light"
      | "dark"
      | "system";
    const root = document.documentElement;

    if (savedTheme === "dark") {
      root.classList.add("dark");
    } else if (savedTheme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "admin") {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0d1117] flex">
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
              <div className="h-8 bg-gray-200 dark:bg-[#0d1117] rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#0d1117] rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#0d1117] flex">
      <AdminSidebar
        user={{
          id: session.user.id,
          name: session.user.name || "",
          email: session.user.email || "",
          role: session.user.role || "user",
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        onNavigate={(href: string) => router.push(href)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPath={currentPath}
      />

      <header className="bg-background dark:bg-[#0d1117] shadow-sm border-b lg:hidden fixed top-0 left-0 right-0 z-40 px-4">
        <div className="relative flex items-center justify-center h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight  dark:text-white">
            Print Pro
          </h1>
        </div>
      </header>

      <div
        className={`flex-1 w-full overflow-x-hidden min-w-0 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"} lg:pt-0 pt-16`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold  dark:text-white">
                Products
              </h1>
              <p className="text-xs lg:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Manage product types, brands, and colors
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10 text-gray-400 hover:bg-gray-200 hover: dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>

          {/* Tabs */}
          <Suspense fallback={<div>Loading...</div>}>
            <ProductTypesTabContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ProductTypesTabContent() {
  const [refetchSize, setRefetchSize] = useState<number>(0);
  const [refetchColor, setRefetchColor] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPath = usePathname();

  const handleTabChange = (value: string) => {
    if (isNavigating || isPending) return;

    startTransition(() => {
      setIsNavigating(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(`${currentPath}?${params.toString()}`);
      setTimeout(() => setIsNavigating(false), 300);
    });
  };
  const activeTab = searchParams.get("tab") || "product-types";
  const isMoreActive = ["sizes"].includes(activeTab);
  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="space-y-6"
    >
      <TabsList className="w-full flex h-9 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg lg:grid lg:grid-cols-4 lg:h-10">
        {/* First 3 tabs: Always visible */}
        <TabsTrigger
          value="product-types"
          disabled={isNavigating || isPending}
          className="flex-1 text-[10px] sm:text-xs lg:text-sm px-1 sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
        >
          {isNavigating && activeTab === "product-types" && (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
          )}
          Product Types
        </TabsTrigger>
        <TabsTrigger
          value="brands"
          disabled={isNavigating || isPending}
          className="flex-1 text-[10px] sm:text-xs lg:text-sm px-1 sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
        >
          {isNavigating && activeTab === "brands" && (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
          )}
          Brands
        </TabsTrigger>
        <TabsTrigger
          value="colors"
          disabled={isNavigating || isPending}
          className="flex-1 text-[10px] sm:text-xs lg:text-sm px-1 sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
        >
          {isNavigating && activeTab === "colors" && (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
          )}
          Colors
        </TabsTrigger>

        {/* Sizes Tab: Visible on desktop, in dropdown on mobile */}
        <TabsTrigger
          value="sizes"
          disabled={isNavigating || isPending}
          className="hidden lg:flex flex-1 text-sm px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
        >
          {isNavigating && activeTab === "sizes" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Sizes
        </TabsTrigger>

        {/* Mobile "More" Dropdown */}
        <div className="lg:hidden flex items-center px-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 rounded-md transition-colors ${isMoreActive ? "bg-background shadow-sm  border dark:bg-gray-700 dark:text-white dark:border-gray-600" : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-40 p-1 flex flex-col gap-1"
              align="end"
            >
              <TabsTrigger
                value="sizes"
                disabled={isNavigating || isPending}
                className="w-full justify-start text-xs sm:text-sm px-2 py-1.5 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                {isNavigating && activeTab === "sizes" ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Sizes"
                )}
              </TabsTrigger>
              {/* Add more overflow tabs here in future */}
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
      <TabsContent value="colors" className="space-y-6">
        <ColorsTab setRefetchColor={setRefetchColor} />
        <ProductBrandColorTable refetchColor={refetchColor} />
      </TabsContent>
      {/* Sizes Tab */}
      <TabsContent value="sizes" className="space-y-6">
        <SizesTab setRefetchSize={setRefetchSize} />
        <ProductBrandSizesTable refetchSize={refetchSize} />
      </TabsContent>
    </Tabs>
  );
}
