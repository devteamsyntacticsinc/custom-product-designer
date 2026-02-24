"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Menu,
  Users,
  ShoppingBag,
  RefreshCw,
  Loader2,
  UserIcon,
  Mail,
  Phone,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminDashboardSkeleton from "../components/AdminDashboardSkeleton";
import {
  DrawerContent,
  DrawerTrigger,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import axios from "axios";
import { OrderWithCustomer, CustomerWithOrders } from "@/types/order";
import OrderProductPreview from "@/components/OrderProductPreview";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = usePathname();
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
    recentActivity: Array<{
      id: string;
      type: "order" | "user" | "product";
      title: string;
      description: string;
      timestamp: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (status === "loading") return; // Still loading session

    if (!session || session.user?.role !== "admin") {
      router.push("/login");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

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

      {/* Mobile Header */}
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
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            Print Pro
          </h1>
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
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
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
                  Total Orders
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

          {/* Recent Activity */}
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
              {dashboardData?.recentActivity.map((activity) => {
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
                  const diffMs = now.getTime() - activityTime.getTime();
                  const diffMins = Math.floor(diffMs / 60000);

                  if (diffMins < 60) {
                    return `${diffMins} min ago`;
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
                      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-4 rounded-md"
                    >
                      <div
                        className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm lg:text-base font-medium">
                          {activity.title}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs lg:text-sm text-gray-500">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </CustomerDrawer>
                );
              }) || (
                <div className="text-center text-gray-500 py-4">
                  No recent activity
                </div>
              )}
            </div>
          </Card>
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
    useState<CustomerWithOrders | null>(null);

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
  }, [open]);

  const { title, description, timestamp } = activity;
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className={cn("", isFetching && "min-h-[45vh]")}>
        <DrawerHeader className="justify-start flex flex-col items-start">
          <DrawerTitle className="flex items-center justify-center gap-2">
            <div
              className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}
            ></div>
            <span className="text-lg">{title}</span>
          </DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
=          {isFetching ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" />
            </div>
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
      className="p-4 sm:p-6 hover:shadow-md transition-shadow overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Product Preview */}
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Product Design
          </h3>
          <OrderProductPreview order={order} />
        </div>

        {/* Order Details */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 border-t border-gray-100">
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-1">
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                #{order.id.toString().slice(-6)}
              </Badge>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">
                {formatDate(order.created_at)}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-xs text-blue-600 border-blue-200 bg-blue-50"
              >
                {totalQuantity} items
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
              {order.brand_type?.[0]?.product_type?.name && (
                <span className="font-semibold text-gray-900">
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
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
          <div className="w-full sm:w-auto sm:text-right space-y-2 border-t sm:border-t-0 pt-4 sm:pt-0">
            {customer ? (
              <div className="flex flex-col sm:items-end gap-1">
                <div className="flex items-center sm:justify-end gap-2 text-sm font-bold text-gray-900">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  {customer.name}
                </div>
                <div className="flex items-center sm:justify-end gap-2 text-xs text-gray-500">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {customer.email}
                </div>
                <div className="flex items-center sm:justify-end gap-2 text-xs text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {customer.contact_number}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic text-left sm:text-right">
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
  customerOrders: CustomerWithOrders;
}) {
  return <div>Customer Content Here</div>;
}
