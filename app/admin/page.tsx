"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Menu,
  Users,
  ShoppingBag,
  RefreshCw,
  UserIcon,
  Mail,
  Phone,
  Package,
} from "lucide-react";
import { CalendarRange } from "@/components/ui/calendar-range";
import { ChartAreaInteractive } from "@/components/ui/area-chart-interactive";
import { ChartBarInteractive } from "@/components/ui/bar-chart";
import { DateRange } from "react-day-picker";
import AdminSidebar from "../components/AdminSidebar";
import AdminDashboardSkeleton from "../components/AdminDashboardSkeleton";
import ActivitySkeleton from "@/components/ActivitySkeleton";
import {
  DrawerContent,
  DrawerTrigger,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import axios from "axios";
import { OrderWithCustomer } from "@/types/order";
import OrderProductPreview from "@/components/OrderProductPreview";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CustomerWithOrdersForDashboard } from "@/types/customer";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = usePathname();
  const [productTypesData, setProductTypesData] = useState<{
    data: Record<string, any>[];
    types: string[];
  }>({ data: [], types: [] });
  const [topCustomersList, setTopCustomersList] = useState<
    Array<{ id: string; name: string; email: string; count: number }>
  >([]);
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalOrders: number;
      totalUsers: number;
      revenue: number;
      activeProducts: number;
      totalBrands: number;
      totalColors: number;
      totalTypes: number;
    };
    recentActivity: {
      activities: Array<{
        id: string;
        type: "order" | "user" | "product";
        title: string;
        description: string;
        timestamp: string;
      }>;
      total: number;
      totalPages: number;
      currentPage: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);

  const [productTypeLoading, setProductTypeLoading] = useState(false);
  const [topCustomersLoading, setTopCustomersLoading] = useState(false);
  const [ptDateRange, setPtDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [selectedProductTypeForCustomers, setSelectedProductTypeForCustomers] =
    useState<string>("all");
  const itemsPerPage = 10; // Make it a constant instead of state
  const hasFetchedRef = useRef(false); // Use ref to track if we've already fetched
  const router = useRouter();

  // Fetch dashboard data
  const fetchDashboardData = useCallback(
    async (page: number = 1) => {
      try {
        const response = await fetch(
          `/api/dashboard?page=${page}&limit=${itemsPerPage}`,
        );
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          hasFetchedRef.current = true; // Mark as fetched
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setPageLoading(false);
      }
    },
    [], // Remove itemsPerPage since it's a constant
  );

  const fetchProductTypes = useCallback(async (from?: Date, to?: Date) => {
    try {
      setProductTypeLoading(true);
      const params = new URLSearchParams();
      if (from) params.set("from", from.toISOString());
      if (to) params.set("to", to.toISOString());
      const response = await fetch(`/api/dashboard?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setProductTypesData(data.data.ordersByProductTypeTimeSeries);
      }
    } catch (error) {
      console.error("Error fetching product types:", error);
    } finally {
      setProductTypeLoading(false);
    }
  }, []);

  const fetchTopCustomers = useCallback(async (productType: string) => {
    try {
      setTopCustomersLoading(true);
      const params = new URLSearchParams();
      if (productType && productType !== "all")
        params.set("productType", productType);
      const response = await fetch(`/api/dashboard?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setTopCustomersList(data.data.topCustomers);
      }
    } catch (error) {
      console.error("Error fetching top customers:", error);
    } finally {
      setTopCustomersLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(currentPage);
    fetchProductTypes(ptDateRange?.from, ptDateRange?.to);
    fetchTopCustomers(selectedProductTypeForCustomers);
  };

  // Effect to refetch when product type date range changes
  useEffect(() => {
    if (ptDateRange?.from) {
      fetchProductTypes(ptDateRange.from, ptDateRange.to);
    } else if (hasFetchedRef.current) {
      fetchProductTypes();
    }
  }, [ptDateRange]);

  // Effect to refetch when selected product type for customers changes
  useEffect(() => {
    if (hasFetchedRef.current) {
      fetchTopCustomers(selectedProductTypeForCustomers);
    }
  }, [selectedProductTypeForCustomers]);

  const handlePageChange = async (page: number) => {
    if (pageLoading || page === currentPage) return; // Prevent duplicate calls
    setPageLoading(true);
    setCurrentPage(page);
    await fetchDashboardData(page);
  };

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (status === "loading") return; // Still loading session

    if (!session || session.user?.role !== "admin") {
      router.push("/login");
      return;
    }

    // Only fetch on initial load when we haven't fetched yet
    if (!hasFetchedRef.current) {
      fetchDashboardData(currentPage);
      fetchProductTypes(ptDateRange?.from, ptDateRange?.to);
      fetchTopCustomers(selectedProductTypeForCustomers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]); // Remove currentPage and fetchDashboardData to prevent re-runs - we use ref instead

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (status === "loading" || !session) {
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
          currentPath="/admin"
        />
        <div className="flex-1 lg:ml-64">
          <AdminDashboardSkeleton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
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
          onNavigate={(href) => router.push(href)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          currentPath={currentPath}
        />
        <div
          className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
        >
          <AdminDashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
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
        onNavigate={(href) => router.push(href)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPath={currentPath}
      />

      {/* Mobile Header */}
      <header className="bg-background shadow-sm border-b lg:hidden fixed top-0 left-0 right-0 z-40 px-4">
        <div className="relative flex items-center justify-center h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight ">Print Pro</h1>
        </div>
      </header>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"} lg:pt-0 pt-16`}
      >
        {/* Dashboard Content */}
        <main className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold ">Dashboard</h1>
              <p className="text-gray-600 text-sm lg:text-base">
                Welcome back, {session.user?.name}!
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm lg:text-base font-medium">
                  Total Ordersh
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.totalOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm lg:text-base font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm lg:text-base font-medium">
                  Active Products
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.activeProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5 new this week
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Charts */}
            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-sm lg:text-base font-medium">
                      Most Ordered Products
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Distribution by product type
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">
                        Date Range
                      </span>
                      <CalendarRange
                        date={ptDateRange}
                        onSelect={setPtDateRange}
                      />
                    </div>

                    {(ptDateRange?.from || ptDateRange?.to) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 mt-5 text-[11px]"
                        onClick={() =>
                          setPtDateRange({ from: undefined, to: undefined })
                        }
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {productTypeLoading ? (
                    <div className="h-[300px] w-full">
                      <Skeleton className="h-full w-full rounded-md" />
                    </div>
                  ) : productTypesData.data.length > 0 ? (
                    <ChartAreaInteractive
                      data={productTypesData.data}
                      config={productTypesData.types.reduce(
                        (acc: any, type: string, index: number) => ({
                          ...acc,
                          [type]: {
                            label: type,
                            color: "#3b82f6",
                          },
                        }),
                        {},
                      )}
                    />
                  ) : (
                    <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                      No product type data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-sm lg:text-base font-medium">
                      Top Customers
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Customers with the most orders
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">
                        Type
                      </span>
                      <Select
                        value={selectedProductTypeForCustomers}
                        onValueChange={setSelectedProductTypeForCustomers}
                      >
                        <SelectTrigger className="w-[150px] h-8 text-[11px]">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">
                            All Types
                          </SelectItem>
                          {(productTypesData.types ?? []).map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="text-xs"
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedProductTypeForCustomers !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 mt-5 text-[11px]"
                        onClick={() => {
                          setSelectedProductTypeForCustomers("all");
                        }}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {topCustomersLoading ? (
                    <div className="h-[300px] w-full">
                      <Skeleton className="h-full w-full rounded-md" />
                    </div>
                  ) : (topCustomersList?.length ?? 0) > 0 ? (
                    <ChartBarInteractive
                      data={topCustomersList}
                      config={{
                        count: {
                          label: "Orders",
                          color: "#3b82f6",
                        },
                      }}
                      dataKey="count"
                      labelKey="name"
                    />
                  ) : (
                    <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground">
                      No customer data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="h-fit">
              <Card className="p-6">
                <div>
                  <CardTitle className="mb-2 text-sm lg:text-base">
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="mb-4 text-xs lg:text-sm">
                    Latest actions in system
                  </CardDescription>
                </div>
                <div className="space-y-4">
                  {pageLoading ? (
                    <ActivitySkeleton />
                  ) : dashboardData?.recentActivity.activities.length ? (
                    dashboardData.recentActivity.activities.map((activity) => {
                      const getActivityColor = (type: string) => {
                        switch (type) {
                          case "order":
                            return "bg-blue-500";
                          case "user":
                            return "bg-green-500";
                          case "product":
                            return "bg-yellow-500";
                          default:
                            return "bg-gray-500";
                        }
                      };

                      const getTimeAgo = (timestamp: string) => {
                        const now = new Date();
                        const activityTime = new Date(timestamp);
                        const diffMins = Math.floor(
                          (now.getTime() - activityTime.getTime()) / 60000,
                        );

                        if (diffMins < 1) {
                          return "Just now";
                        } else if (diffMins < 60) {
                          return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
                        } else if (diffMins < 1440) {
                          return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? "s" : ""} ago`;
                        } else {
                          return `${Math.floor(diffMins / 1440)} day${Math.floor(diffMins / 1440) > 1 ? "s" : ""} ago`;
                        }
                      };

                      return (
                        <CustomerDrawer
                          key={activity.id}
                          activity={activity}
                          getActivityColor={getActivityColor}
                        >
                          <div
                            key={activity.id}
                            className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-md"
                          >
                            <div
                              className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-sm lg:text-base font-medium">
                                {activity.title}
                              </p>
                              <p className="text-xs lg:text-sm text-muted-foreground">
                                {activity.description}
                              </p>
                            </div>
                            <span className="text-xs lg:text-sm text-muted-foreground">
                              {getTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </CustomerDrawer>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No recent activity
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {dashboardData?.recentActivity.totalPages &&
                  dashboardData.recentActivity.totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={
                                currentPage === 1 || pageLoading
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>

                          {Array.from(
                            { length: dashboardData.recentActivity.totalPages },
                            (_, i) => i + 1,
                          ).map((page) => {
                            if (
                              page === 1 ||
                              page ===
                                dashboardData.recentActivity.totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                    className={
                                      pageLoading
                                        ? "pointer-events-none"
                                        : "cursor-pointer"
                                    }
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={
                                currentPage ===
                                  dashboardData.recentActivity.totalPages ||
                                pageLoading
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function CustomerDrawer({
  children,
  activity,
  getActivityColor,
}: {
  children: React.ReactNode;
  activity: {
    id: string;
    type: "order" | "user" | "product";
    title: string;
    description: string;
    timestamp: string;
  };
  getActivityColor: (type: "order" | "user" | "product") => string;
}) {
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [orderData, setOrderData] = useState<OrderWithCustomer | null>(null);
  const [customerWithOrders, setCustomerWithOrders] =
    useState<CustomerWithOrdersForDashboard | null>(null);

  const isOrderActivity = activity.id.includes("order");

  useEffect(() => {
    // TODO: Fetch customer order data when drawer opens
    if (open) {
      const fetchCustomerOrderData = async (orderId: string) => {
        try {
          console.log(orderId);
          setIsFetching(true);

          const response = await axios.get(`/api/admin/orders/${orderId}`);

          const data = response.data;
          if (orderId.includes("user")) {
            setCustomerWithOrders(data.data);
          }
          if (orderId.includes("order")) {
            setOrderData(data.data);
          }

          return data;
        } catch (error) {
          console.error("Error fetching customer order data:", error);
          return null;
        } finally {
          setIsFetching(false);
        }
      };
      fetchCustomerOrderData(activity.id);
    } else {
      setOrderData(null);
      setCustomerWithOrders(null);
    }
  }, [activity.id, open]);

  const { title, description } = activity;
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className={cn("", isFetching && "min-h-[45vh]")}>
        <DrawerHeader className="justify-between flex flex-row items-center">
          <div className="justify-start flex flex-col items-start">
            <DrawerTitle className="flex items-center justify-center gap-2">
              <div
                className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}
              />
              <span className="text-lg">{title}</span>
            </DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </div>
          <Link href={isOrderActivity ? "/admin/orders" : "/admin/customers"}>
            <Button className="" variant={"outline"}>
              {isOrderActivity ? "Go to Orders Page" : "Go to Customers Page"}
            </Button>
          </Link>
        </DrawerHeader>
        {isFetching ? (
          <OrderDetailsSkeleton />
        ) : orderData ? (
          <OrderDetails order={orderData} />
        ) : customerWithOrders ? (
          <CustomerWithOrdersDetails customerOrders={customerWithOrders} />
        ) : (
          <div>Nothing to see here</div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function OrderDetails({ order }: { order: OrderWithCustomer }) {
  const getCustomerInfo = (customers: OrderWithCustomer["customers"]) => {
    if (Array.isArray(customers)) {
      return customers[0] || null;
    }
    return customers;
  };
  const getTotalQuantity = (order: OrderWithCustomer) => {
    return (
      order.product_sizes?.reduce(
        (total, size) => total + (size.quantity || 0),
        0,
      ) || 0
    );
  };
  const customer = getCustomerInfo(order.customers);
  const totalQuantity = getTotalQuantity(order);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      key={order.id}
      className="p-4 sm:p-6 hover:shadow-md transition-shadow overflow-y-auto border-none shadow-none"
    >
      <div className="space-y-6">
        {/* Product Preview */}
        <div>
          <h3 className="text-base lg:text-lg font-semibold  mb-3 sm:mb-4">
            Product Design
          </h3>
          <OrderProductPreview order={order} />
        </div>

        {/* Order Details */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-1">
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                #{order.id.toString().slice(-6)}
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                {formatDate(order.created_at)}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-xs text-blue-600 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
              >
                {totalQuantity} items
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {order.brand_type?.[0]?.product_type?.name && (
                <span className="font-semibold ">
                  {order.brand_type[0].product_type.name}
                </span>
              )}
              {order.brand_type?.[0]?.brands?.name && (
                <span className="flex items-center gap-1">
                  <span className="hidden sm:inline">•</span>
                  {order.brand_type[0].brands.name}
                </span>
              )}
              {order.colors?.[0]?.value && (
                <span className="flex items-center gap-1">
                  <span className="hidden sm:inline">•</span>
                  {order.colors[0].value}
                </span>
              )}
            </div>

            {/* Sizes */}
            {order.product_sizes && order.product_sizes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sizes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {order.product_sizes.map((size) => (
                    <Badge
                      key={size.id}
                      variant="outline"
                      className="text-[10px] sm:text-xs px-2 py-0 h-5"
                    >
                      {size.sizes?.value || "Unknown"} ({size.quantity})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="w-full sm:w-auto sm:text-right space-y-2 border-t sm:border-t-0 pt-4 sm:pt-0 dark:border-gray-800">
            {customer ? (
              <div className="flex flex-col sm:items-end gap-1">
                <div className="flex items-center sm:justify-end gap-2 text-sm font-bold ">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {customer.name}
                </div>
                <div className="flex items-center sm:justify-end gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {customer.email}
                </div>
                <div className="flex items-center sm:justify-end gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {customer.contact_number}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic text-left sm:text-right">
                Customer info unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CustomerWithOrdersDetails({
  customerOrders,
}: {
  customerOrders: CustomerWithOrdersForDashboard;
}) {
  const customer = customerOrders.customer;
  const orders = customerOrders.orders;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 overflow-y-auto">
      {/* Left Column - Customer Details */}
      <Card className="py-6 lg:col-span-1 max-h-fit">
        <CardHeader className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold ">
              {customer?.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Customer ID: #{customer?.id.toString().slice(-6)}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm ">{customer?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm ">{customer?.contact_number}</span>
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Order History */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold ">Order History</h3>
          <Badge variant="secondary" className="text-xs">
            {customerOrders.orders.length} orders
          </Badge>
        </div>

        {orders.length === 0 ? (
          <Card className="p-8 text-center h-96 justify-center">
            <div className="text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="">No orders found</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {orders.map((order) => (
              <CustomerOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerOrderCard({
  order,
}: {
  order: CustomerWithOrdersForDashboard["orders"][0];
}) {
  const getTotalQuantity = (
    order: CustomerWithOrdersForDashboard["orders"][0],
  ) => {
    return (
      order.product_sizes?.reduce(
        (total, size) => total + (size.quantity || 0),
        0,
      ) || 0
    );
  };

  const totalQuantity = getTotalQuantity(order);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Order Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              #{order.id.toString().slice(-6)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(order.created_at)}
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-xs text-blue-600 border-blue-200 bg-blue-50"
          >
            {totalQuantity} items
          </Badge>
        </div>

        {/* Product Preview */}
        <div>
          <OrderProductPreview
            order={{
              ...order,
              customers: null,
            }}
          />
        </div>

        {/* Order Details */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
            {order.brand_type?.[0]?.product_type?.name && (
              <span className="font-semibold ">
                {order.brand_type[0].product_type.name}
              </span>
            )}
            {order.brand_type?.[0]?.brands?.name && (
              <span className="flex items-center gap-1">
                <span>•</span>
                {order.brand_type[0].brands.name}
              </span>
            )}
            {order.colors?.[0]?.value && (
              <span className="flex items-center gap-1">
                <span>•</span>
                {order.colors[0].value}
              </span>
            )}
          </div>

          {/* Sizes */}
          {order.product_sizes && order.product_sizes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sizes:
              </span>
              <div className="flex flex-wrap gap-1">
                {order.product_sizes.map((size) => (
                  <Badge
                    key={size.id}
                    variant="outline"
                    className="text-xs px-2 py-0 h-5"
                  >
                    {size.sizes?.value || "Unknown"} ({size.quantity})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function OrderDetailsSkeleton() {
  return (
    <Card className="p-4 sm:p-6 border-none shadow-none">
      <div className="space-y-6">
        {/* Product Design Skeleton */}
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse mb-3 sm:mb-4" />
          <div className="bg-gray-100 rounded-lg h-48 w-full animate-pulse" />
        </div>

        {/* Order Details Skeleton */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 border-t border-gray-100">
          <div className="flex-1 space-y-3 w-full">
            {/* Order ID, Date, Items Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-1">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Product Type, Brand, Color */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Sizes */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="flex flex-wrap gap-1.5">
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Customer Info Skeleton */}
          <div className="w-full sm:w-auto sm:text-right space-y-2 border-t sm:border-t-0 pt-4 sm:pt-0">
            <div className="flex flex-col sm:items-end gap-1">
              <div className="flex items-center sm:justify-end gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center sm:justify-end gap-2">
                <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse" />
                <div className="h-3.5 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center sm:justify-end gap-2">
                <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse" />
                <div className="h-3.5 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
