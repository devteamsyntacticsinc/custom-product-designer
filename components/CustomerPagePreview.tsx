import { useEffect, useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronRight,
  Package,
  Calendar,
  Ruler,
  ImageIcon,
  File,
  X,
} from "lucide-react";
import { CustomerWithOrders } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import OrderProductPreview from "./OrderProductPreview";
import CustomerPageSkeleton from "./CustomerPageSkeleton";
import OrderHistorySkeleton from "./OrderHistorySkeleton";
import { CustomerService } from "@/lib/api/customer";
import { Button } from "./ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "./ui/label";
import axios from "axios";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CustomerTableReceipt from "@/app/components/receipts/CustomerTableReceipt";
import { useToast } from "@/contexts/ToastContext";

interface ProcessedOrderRow {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  orderId: string;
  productType: string;
  brand: string;
  size: string;
  color: string;
  date: string;
}

type FilterValues = {
  product_type: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  size: { id: number; value: string } | null;
  color: { id: number; value: string } | null;
  date_range: string;
};

export default function CustomersTab() {
  const [customers, setCustomers] = useState<
    (CustomerWithOrders & {
      isLoadingOrders?: boolean;
      ordersLoaded?: boolean;
    })[]
  >([]);
  const [isFetchingCustomers, setIsFetchingCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [processedOrders, setProcessedOrders] = useState<ProcessedOrderRow[]>(
    [],
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [cooldownIds, setCooldownIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();
  const [filterValues, setFilterValues] = useState<FilterValues>({
    product_type: null,
    brand: null,
    size: null,
    color: null,
    date_range: "",
  });
  const [filtersDataIsLoading, setFiltersDataIsLoading] = useState(false);
  const [filterData, setFilterData] = useState({
    product_type: [] as { id: number; name: string }[],
    brand: [] as { id: number; name: string }[],
    size: [] as { id: number; value: string }[],
    color: [] as { id: number; value: string }[],
    date_range: [] as string[],
  });

  const fetchCustomers = async () => {
    try {
      setError(null);
      setIsFetchingCustomers(true);

      // Build query string from filter values
      const queryParams = new URLSearchParams();
      if (filterValues.product_type)
        queryParams.append("product_type", filterValues.product_type.name);
      if (filterValues.brand)
        queryParams.append("brand", filterValues.brand.name);
      if (filterValues.size)
        queryParams.append("size", filterValues.size.value);
      if (filterValues.color)
        queryParams.append("color", filterValues.color.value);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/api/customers?${queryString}`
        : "/api/customers";

      const data = await axios.get(url);
      const customers = data.data;

      setCustomers(customers || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsFetchingCustomers(false);
    }
  };

  const handleDownload = () => {
    const pdfId = "customer-table-pdf";

    // Check if this PDF is on cooldown
    if (cooldownIds.has(pdfId)) {
      return;
    }

    // Add to cooldown immediately
    setCooldownIds((prev) => {
      const next = new Set(prev);
      next.add(pdfId);
      return next;
    });

    // Remove from cooldown after 3 seconds
    setTimeout(() => {
      setCooldownIds((prev) => {
        const next = new Set(prev);
        next.delete(pdfId);
        return next;
      });
    }, 3000);

    // Show success message
    addToast("success", "Customer report downloaded successfully");
  };

  const fetchOrdersForPdf = async () => {
    setIsGeneratingPdf(true);
    const allOrderRows: ProcessedOrderRow[] = [];

    try {
      // Only process customers that are already filtered and displayed in the table
      for (const customer of customers) {
        try {
          // Fetch orders for this customer
          const response = await axios.get(
            `/api/customers/${customer.id.toString()}`,
          );
          const customerOrders = response.data.data;

          // Apply the same filtering logic as the table
          const filteredOrders = filterOrdersByValues(customerOrders);

          // Process each filtered order to create individual rows
          filteredOrders.forEach((order: any) => {
            const brandType = order.brand_type?.[0];

            allOrderRows.push({
              customerId: customer.id,
              customerName: customer.name,
              customerEmail: customer.email,
              customerContact: customer.contact_number,
              orderId: order.id,
              productType: brandType?.product_type?.name || "N/A",
              brand: brandType?.brands?.name || "N/A",
              size: order.product_sizes?.[0]?.sizes?.value || "N/A",
              color: order.colors?.[0]?.value || "N/A",
              date: new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            });
          });

          // If customer has no filtered orders but exists in the filtered table,
          // add a row with N/A values to show the customer was included
          if (filteredOrders.length === 0) {
            allOrderRows.push({
              customerId: customer.id,
              customerName: customer.name,
              customerEmail: customer.email,
              customerContact: customer.contact_number,
              orderId: "N/A",
              productType: "N/A",
              brand: "N/A",
              size: "N/A",
              color: "N/A",
              date: "N/A",
            });
          }
        } catch (error) {
          console.error(
            `Error fetching orders for customer ${customer.id}:`,
            error,
          );
          // Still add customer row even if orders fail to load
          allOrderRows.push({
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerContact: customer.contact_number,
            orderId: "N/A",
            productType: "N/A",
            brand: "N/A",
            size: "N/A",
            color: "N/A",
            date: "N/A",
          });
        }
      }

      setProcessedOrders(allOrderRows);
    } catch (error) {
      console.error("Error processing orders for PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const hasBrands =
    filterValues.product_type && filterValues.product_type.id
      ? customers.some((customer) => customer.hasBrands)
      : true;

  const filterOrdersByValues = (orders: any[]) => {
    return orders.filter((order) => {
      const brandType = order.brand_type?.[0];

      // Check product type filter
      if (filterValues.product_type && brandType?.product_type?.name) {
        if (brandType.product_type.name !== filterValues.product_type.name) {
          return false;
        }
      }

      // Check brand filter
      if (filterValues.brand && brandType?.brands?.name) {
        if (brandType.brands.name !== filterValues.brand.name) {
          return false;
        }
      }

      // Check color filter
      if (filterValues.color && order.colors?.[0]?.value) {
        if (order.colors[0].value !== filterValues.color.value) {
          return false;
        }
      }

      // Check size filter
      if (filterValues.size && order.product_sizes) {
        const hasMatchingSize = order.product_sizes.some(
          (ps: any) => ps.sizes?.value === filterValues.size?.value,
        );
        if (!hasMatchingSize) {
          return false;
        }
      }

      return true;
    });
  };

  const fetchCustomerOrders = async (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);

    if (!customer || customer.ordersLoaded || customer.isLoadingOrders) return;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, isLoadingOrders: true } : c,
      ),
    );

    try {
      const orders = await axios.get(`/api/customers/${customerId.toString()}`);
      const customerOrders = orders.data.data;

      // Filter orders based on current filter values
      const filteredOrders = filterOrdersByValues(customerOrders);

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                orders: filteredOrders,
                isLoadingOrders: false,
                ordersLoaded: true,
              }
            : c,
        ),
      );
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      // axios error
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
      }
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, isLoadingOrders: false } : c,
        ),
      );
    }
  };

  const fetchFilterData = async () => {
    try {
      setFiltersDataIsLoading(true);
      const productTypeRes = await axios.get("/api/filters");
      const data = productTypeRes.data;
      setFilterData(data);
    } catch (error) {
      console.error("Error fetching filter data:", error);
    } finally {
      setFiltersDataIsLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
      fetchCustomerOrders(id);
    }
    setExpandedRows(newExpandedRows);
  };

  useEffect(() => {
    fetchCustomers();
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [
    filterValues.product_type,
    filterValues.brand,
    filterValues.size,
    filterValues.color,
  ]);

  // Reset ordersLoaded and close expanded rows when filters change to force refetch with new filters
  useEffect(() => {
    setCustomers((prev) =>
      prev.map((c) => ({
        ...c,
        ordersLoaded: false,
        orders: [],
      })),
    );
    // Close all expanded rows when filters change
    setExpandedRows(new Set());
    // Reset processed orders to force PDF refresh
    setProcessedOrders([]);
  }, [
    filterValues.product_type,
    filterValues.brand,
    filterValues.size,
    filterValues.color,
  ]);

  if (isFetchingCustomers) {
    return <CustomerPageSkeleton />;
  }
  return (
    <Card className="overflow-hidden">
      <CardHeader className="max-sm:py-4 sm:py-6 ">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-2xl">
            Customer Management
          </CardTitle>
          {isGeneratingPdf ? (
            <Button className="" variant="outline" disabled>
              <File className="mr-2 h-4 w-4 animate-spin" /> Generating PDF...
            </Button>
          ) : processedOrders.length > 0 ? (
            <PDFDownloadLink
              document={
                <CustomerTableReceipt
                  processedOrders={processedOrders}
                  filterValues={filterValues}
                />
              }
              fileName="customer-table.pdf"
            >
              {({ loading }) => (
                <Button
                  className=""
                  variant="outline"
                  disabled={loading || cooldownIds.has("customer-table-pdf")}
                  onClick={handleDownload}
                >
                  <File className="mr-2 h-4 w-4" />
                  {cooldownIds.has("customer-table-pdf")
                    ? "Please wait..."
                    : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          ) : (
            <Button className="" variant="outline" onClick={fetchOrdersForPdf}>
              <File className="mr-2 h-4 w-4" /> Prepare PDF
            </Button>
          )}
        </div>
        {filtersDataIsLoading ? (
          <div className="flex items-center gap-2 w-full mt-4 overflow-y-auto p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-1 min-w-[150px]">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
            <div className="ml-auto mt-auto">
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full mt-4 overflow-y-auto p-2">
            {/* Product type */}
            <div className="gap-2 flex flex-col">
              <Label className="">Product Type</Label>
              <Combobox
                placeholder="Product Type"
                value={filterValues.product_type?.name || ""}
                onValueChange={(value) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    product_type:
                      filterData.product_type.find(
                        (item) => item.name === value,
                      ) || null,
                  }))
                }
                options={filterData.product_type.map((item) => ({
                  value: item.name,
                  label: item.name,
                }))}
                className="w-42"
              />
            </div>

            {/* brand */}
            <div className="gap-2 flex flex-col">
              <Label className="">Brand</Label>
              <Combobox
                placeholder="Brand"
                value={filterValues.brand?.name || ""}
                onValueChange={(value) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    brand:
                      filterData.brand.find((item) => item.name === value) ||
                      null,
                  }))
                }
                options={filterData.brand.map((item) => ({
                  value: item.name,
                  label: item.name,
                }))}
                className="w-42"
                disabled={!hasBrands}
              />
            </div>

            {/* size */}
            <div className="gap-2 flex flex-col">
              <Label className="">Size</Label>
              <Combobox
                placeholder="Size"
                value={filterValues.size?.value || ""}
                onValueChange={(value) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    size:
                      filterData.size.find((item) => item.value === value) ||
                      null,
                  }))
                }
                options={filterData.size.map((item) => ({
                  value: item.value,
                  label: item.value,
                }))}
                className="w-42"
              />
            </div>

            {/* Color */}
            <div className="gap-2 flex flex-col">
              <Label className="">Color</Label>
              <Combobox
                placeholder="Color"
                value={filterValues.color?.value || ""}
                onValueChange={(value) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    color:
                      filterData.color.find((item) => item.value === value) ||
                      null,
                  }))
                }
                options={filterData.color.map((item) => ({
                  value: item.value,
                  label: item.value,
                }))}
                className="w-42"
                disabled={!hasBrands}
              />
            </div>

            {/* Date Range */}
            {/* <Combobox
            placeholder="Date Range"
            label="Date Range"
            filterKey="date_range"
            data={["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          /> */}

            <Button
              className="ml-auto mt-auto"
              variant="outline"
              disabled={
                filterValues.product_type === null &&
                filterValues.brand === null &&
                filterValues.size === null &&
                filterValues.color === null &&
                filterValues.date_range === ""
              }
              onClick={() =>
                setFilterValues({
                  product_type: null,
                  brand: null,
                  size: null,
                  color: null,
                  date_range: "",
                })
              }
            >
              <X className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="max-sm:p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead className="text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-400"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <Fragment key={customer.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => toggleRow(customer.id)}
                    >
                      <TableCell>
                        {expandedRows.has(customer.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {customer.email}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {customer.contact_number}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-normal">
                          {customer.orders?.length || 0}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(customer.id) && (
                      <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                        <TableCell colSpan={5} className="p-0">
                          <div className="p-4 sm:p-6 space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Order History
                            </h4>
                            {customer.isLoadingOrders ? (
                              <OrderHistorySkeleton />
                            ) : !customer.orders ||
                              customer.orders.length === 0 ||
                              !customer.orders[0].id ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                                No order records found.
                              </p>
                            ) : (
                              <div className="grid gap-6">
                                {customer.orders.map((order) => {
                                  const totalQuantity =
                                    order.product_sizes?.reduce(
                                      (total, size) =>
                                        total + (size.quantity || 0),
                                      0,
                                    ) || 0;
                                  const brandType = order.brand_type?.[0];

                                  return (
                                    <div
                                      key={order.id}
                                      className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                      {/* Order Header */}
                                      <div className="bg-gray-50/50 dark:bg-gray-700/50 px-4 py-3 border-b dark:border-gray-600 flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex items-center gap-3">
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] sm:text-xs font-bold bg-white dark:bg-gray-800"
                                          >
                                            #{String(order.id).slice(-6)}
                                          </Badge>
                                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span className="text-[11px] font-semibold">
                                              {new Date(
                                                order.created_at,
                                              ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                              })}
                                            </span>
                                          </div>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] sm:text-xs text-blue-600 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 font-bold px-2 py-0.5"
                                        >
                                          {totalQuantity} items
                                        </Badge>
                                      </div>

                                      <div className="p-4 sm:p-6 space-y-6">
                                        {/* Product Preview Section */}
                                        <div>
                                          <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <ImageIcon className="h-3.5 w-3.5" />
                                            Product Design
                                          </h5>
                                          <OrderProductPreview
                                            order={{
                                              ...order,
                                              id: String(order.id),
                                              customers: {
                                                id: customer.id,
                                                name: customer.name,
                                                email: customer.email,
                                                contact_number:
                                                  customer.contact_number,
                                              },
                                            }}
                                          />
                                        </div>

                                        {/* Detailed Info Section */}
                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                          {/* Product & Brand Info */}
                                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                                            {brandType?.product_type?.name && (
                                              <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded italic">
                                                {brandType.product_type.name}
                                              </span>
                                            )}
                                            {brandType?.brands?.name && (
                                              <span className="flex items-center gap-2">
                                                <span className="text-gray-300 dark:text-gray-600">
                                                  •
                                                </span>
                                                <span className="font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                  <Package className="h-3.5 w-3.5" />
                                                  {brandType.brands.name}
                                                </span>
                                              </span>
                                            )}
                                            {order.colors?.[0]?.value && (
                                              <span className="flex items-center gap-2">
                                                <span className="text-gray-300 dark:text-gray-600">
                                                  •
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                  <div
                                                    className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
                                                    style={{
                                                      backgroundColor:
                                                        order.colors[0].value,
                                                    }}
                                                  />
                                                  <span className="font-bold text-gray-600 dark:text-gray-400 uppercase text-[11px]">
                                                    {order.colors[0].value}
                                                  </span>
                                                </div>
                                              </span>
                                            )}
                                          </div>

                                          {/* Sizes & Quantities */}
                                          {order.product_sizes &&
                                            order.product_sizes.length > 0 && (
                                              <div className="gap-2 flex flex-col">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                  <Ruler className="h-3 w-3" />
                                                  Sizes & Quantities
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                  {order.product_sizes.map(
                                                    (ps) => (
                                                      <Badge
                                                        key={ps.id}
                                                        variant="secondary"
                                                        className="text-[11px] font-bold px-2.5 py-1 bg-blue-50/50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                                                      >
                                                        {ps.sizes?.value ||
                                                          "Unknown"}
                                                        :{" "}
                                                        <span className="ml-1 text-black dark:text-white bg-white dark:bg-gray-700 px-1.5 rounded">
                                                          {ps.quantity}
                                                        </span>
                                                      </Badge>
                                                    ),
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
