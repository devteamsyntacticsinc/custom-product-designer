"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderWithCustomer } from "@/types/order";
import {
  Menu,
  User as UserIcon,
  Mail,
  Package,
  RefreshCw,
  Phone,
  Download,
  Check,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import OrdersPageSkeleton from "../../../components/OrdersPageSkeleton";
import OrderProductPreview from "../../../components/OrderProductPreview";
import axios from "axios";
import { useToast } from "@/contexts/ToastContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import OrderReceiptPDF from "@/app/components/receipts/OrderReceiptPDF";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();
  const { addToast } = useToast();
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [sendingEmailIds, setSendingEmailIds] = useState<Set<string>>(
    new Set(),
  );

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

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/admin/orders");
      const data = response.data;
      setOrders(data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleSendPickupEmail = async (orderId: string) => {
    setSendingEmailIds((prev) => new Set(prev).add(orderId));
    try {
      const res = await axios.post(`/api/orders/${orderId}/pickup-mail`);

      const data = res.data;
      addToast("success", data.message);
    } catch (error: any) {
      console.error("Error sending pickup email:", error);
      const msg = error.response?.data?.error || "Failed to send pickup email";

      addToast("error", msg);
    } finally {
      setSendingEmailIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleDownload = (orderId: string) => {
    // Use setTimeout to defer state update until after download triggers
    setTimeout(() => {
      setDownloadedIds((prev) => {
        const next = new Set(prev);
        next.add(orderId);
        return next;
      });
      addToast("success", "Receipt downloaded successfully");
    }, 0);
  };

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (status === "loading") return; // Still loading session

    if (!session || session.user?.role !== "admin") {
      router.push("/login");
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const getCustomerInfo = (customers: OrderWithCustomer["customers"]) => {
    if (Array.isArray(customers)) {
      return customers[0] || null;
    }
    return customers;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalQuantity = (order: OrderWithCustomer) => {
    return (
      order.product_sizes?.reduce(
        (total, size) => total + (size.quantity || 0),
        0,
      ) || 0
    );
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
          currentPath="/admin/orders"
        />
        <div className="flex-1 lg:ml-64 lg:pt-0 pt-16">
          <OrdersPageSkeleton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
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
          onNavigate={handleNavigate}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          currentPath={currentPath}
        />
        <div
          className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"} lg:pt-0 pt-16`}
        >
          <OrdersPageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
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
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPath={currentPath}
      />

      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b lg:hidden fixed top-0 left-0 right-0 z-40 px-4">
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
        {/* Orders Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Orders
              </h1>
              <p className="text-xs lg:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Manage all customer orders
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className=" h-8 w-8 sm:h-10 sm:w-10 text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>

          {/* Orders List */}
          <div className="space-y-4 sm:space-y-6">
            {orders.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No orders yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  When customers place orders, they will appear here.
                </p>
              </Card>
            ) : (
              orders.map((order) => {
                const customer = getCustomerInfo(order.customers);
                const totalQuantity = getTotalQuantity(order);
                const customerName =
                  customer?.name
                    ?.trim()
                    .toLowerCase()
                    .replace(/\s+/g, "-") // replace ALL spaces (1 or more) with single -
                    .replace(/[^a-z0-9-]/g, "") // remove special characters
                    .replace(/-+/g, "-") // remove duplicate dashes
                    .replace(/^-|-$/g, "") || "unknown-customer"; // remove leading/trailing dash

                return (
                  <Card
                    key={order.id}
                    className="p-4 sm:p-6 hover:shadow-md transition-shadow dark:bg-gray-800"
                  >
                    <div className="space-y-6">
                      {/* Product Preview */}
                      <div>
                        <div className="flex items-center content-center justify-between mb-2">
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                            Product Design
                          </h3>
                          <div className="flex items-center gap-2">
                            {downloadedIds.has(order.id) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className=" h-10 w-fit sm:h-10 sm:w-fit shrink-0 gap-2 hover:bg-green-50 hover:text-green-500 cursor-not-allowed bg-green-50 border-green-500"
                              >
                                <Check
                                  className={`h-4 w-4 sm:h-5 sm:w-5 text-green-500`}
                                />
                                <span className="text-green-500">
                                  Downloaded
                                </span>
                              </Button>
                            ) : (
                              // Then in JSX:
                              <PDFDownloadLink
                                document={<OrderReceiptPDF order={order} />}
                                fileName={`${customerName}.pdf`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(order.id)}
                                  className="h-10 w-fit sm:h-10 sm:w-fit text-gray-900 hover:bg-gray-200 transition-colors shrink-0 gap-2 cursor-pointer"
                                >
                                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span>Download Receipt</span>
                                </Button>
                              </PDFDownloadLink>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendPickupEmail(order.id)}
                              disabled={sendingEmailIds.has(order.id)}
                              className=" h-10 w-fit sm:h-10 sm:w-fit text-gray-900 hover:bg-gray-200 transition-colors shrink-0 gap-2 cursor-pointer"
                            >
                              <Mail
                                className={`h-4 w-4 sm:h-5 sm:w-5 ${sendingEmailIds.has(order.id) ? "animate-pulse" : ""}`}
                              />
                              <span>
                                {sendingEmailIds.has(order.id)
                                  ? "Sending..."
                                  : "Send Pickup Email"}
                              </span>
                            </Button>
                          </div>
                        </div>
                        <OrderProductPreview order={order} />
                      </div>

                      {/* Order Details */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex-1 space-y-3 w-full">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-1">
                            <Badge
                              variant="secondary"
                              className="text-[10px] sm:text-xs"
                            >
                              #{order.id.toString().slice(-6)}
                            </Badge>
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {formatDate(order.created_at)}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] sm:text-xs text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-600 dark:text-white "
                            >
                              {totalQuantity} items
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
                            {order.brand_type?.[0]?.product_type?.name && (
                              <span className="font-semibold text-gray-900 dark:text-gray-400">
                                {order.brand_type[0].product_type.name}
                              </span>
                            )}
                            {order.brand_type?.[0]?.brands?.name && (
                              <span className="flex items-center gap-1 dark:text-gray-400">
                                <span className="hidden sm:inline">•</span>
                                {order.brand_type[0].brands.name}
                              </span>
                            )}
                            {order.colors?.[0]?.value && (
                              <span className="flex items-center gap-1 dark:text-gray-400">
                                <span className="hidden sm:inline">•</span>
                                {order.colors[0].value}
                              </span>
                            )}
                          </div>

                          {/* Sizes */}
                          {order.product_sizes &&
                            order.product_sizes.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Sizes:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {order.product_sizes.map((size) => (
                                    <Badge
                                      key={size.id}
                                      variant="outline"
                                      className="text-[10px] sm:text-xs px-2 py-0 h-5 dark:bg-blue-600 dark:text-white"
                                    >
                                      {size.sizes?.value || "Unknown"} (
                                      {size.quantity})
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Customer Info */}
                        <div className="w-full sm:w-auto sm:text-right space-y-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                          {customer ? (
                            <div className="flex flex-col sm:items-end gap-1 dark:text-gray-400">
                              <div className="flex items-center sm:justify-end gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                <UserIcon className="h-4 w-4 text-gray-400" />
                                {customer.name}
                              </div>
                              <div className="flex items-center sm:justify-end gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                {customer.email}
                              </div>
                              <div className="flex items-center sm:justify-end gap-2 text-xs text-gray-500 dark:text-gray-400">
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
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
