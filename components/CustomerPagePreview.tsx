import {
  useEffect,
  useState,
  Fragment,
  memo,
  useMemo,
  useCallback,
} from "react";
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
  Download,
} from "lucide-react";
import { CustomerWithOrders } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import OrderProductPreview from "./OrderProductPreview";
import OrderHistorySkeleton from "./OrderHistorySkeleton";
import FiltersSkeleton from "./loading/FiltersSkeleton";
import CustomerTableSkeleton from "./loading/CustomerTableSkeleton";
import { Button } from "./ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "./ui/label";
import axios from "axios";
import { CalendarRange } from "@/components/ui/calendar-range";
import { DateRange } from "react-day-picker";
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
  date_range: DateRange | undefined;
};

// Memoized filter components to prevent unnecessary re-renders
const FilterSection = memo(
  ({
    filterValues,
    setFilterValues,
    filterData,
    hasBrands,
    onReset,
    isResetDisabled,
  }: {
    filterValues: FilterValues;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterValues>>;
    filterData: {
      product_type: { id: number; name: string }[];
      brand: { id: number; name: string }[];
      size: { id: number; value: string }[];
      color: { id: number; value: string }[];
      date_range: string[];
    };
    hasBrands: boolean;
    onReset: () => void;
    isResetDisabled: boolean;
  }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="flex flex-col gap-1">
          <Label className="">Product Type</Label>
          <Combobox
            placeholder="Product Type"
            value={filterValues.product_type?.name || ""}
            onValueChange={(value) =>
              setFilterValues((prev) => ({
                ...prev,
                product_type:
                  filterData.product_type.find((item) => item.name === value) ||
                  null,
              }))
            }
            options={filterData.product_type.map((item) => ({
              value: item.name,
              label: item.name,
            }))}
            className="w-42"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="">Brand</Label>
          <Combobox
            placeholder="Brand"
            value={filterValues.brand?.name || ""}
            onValueChange={(value) =>
              setFilterValues((prev) => ({
                ...prev,
                brand:
                  filterData.brand.find((item) => item.name === value) || null,
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

        <div className="flex flex-col gap-1">
          <Label className="">Size</Label>
          <Combobox
            placeholder="Size"
            value={filterValues.size?.value || ""}
            onValueChange={(value) =>
              setFilterValues((prev) => ({
                ...prev,
                size:
                  filterData.size.find((item) => item.value === value) || null,
              }))
            }
            options={filterData.size.map((item) => ({
              value: item.value,
              label: item.value,
            }))}
            className="w-42"
            disabled={!hasBrands}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="">Color</Label>
          <Combobox
            placeholder="Color"
            value={filterValues.color?.value || ""}
            onValueChange={(value) =>
              setFilterValues((prev) => ({
                ...prev,
                color:
                  filterData.color.find((item) => item.value === value) || null,
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
        <div className="flex flex-col gap-1">
          <Label className="">Date Range</Label>
          <div className="flex items-center gap-2">
            <CalendarRange
              date={filterValues.date_range}
              onSelect={(date) =>
                setFilterValues((prev) => ({
                  ...prev,
                  date_range: date,
                }))
              }
            />
            {(filterValues.date_range?.from || filterValues.date_range?.to) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() =>
                  setFilterValues((prev) => ({
                    ...prev,
                    date_range: undefined,
                  }))
                }
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <Button
          className="ml-auto mt-auto"
          variant="outline"
          disabled={isResetDisabled}
          onClick={onReset}
        >
          <X className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    );
  },
);

FilterSection.displayName = "FilterSection";

// Memoized PDF/CSV export section
const ExportSection = memo(
  ({
    processedOrders,
    filterValues,
    isGeneratingPdf,
    cooldownIds,
    isGeneratingCsv,
    csvCooldownIds,
    onDownload,
    onCsvDownload,
    onFetchOrdersForPdf,
  }: {
    processedOrders: ProcessedOrderRow[];
    filterValues: FilterValues;
    isGeneratingPdf: boolean;
    cooldownIds: Set<string>;
    isGeneratingCsv: boolean;
    csvCooldownIds: Set<string>;
    onDownload: () => void;
    onCsvDownload: () => void;
    onFetchOrdersForPdf: () => void;
  }) => {
    return (
      <div className="flex gap-2">
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
                onClick={onDownload}
              >
                <File className="mr-2 h-4 w-4" />
                {cooldownIds.has("customer-table-pdf")
                  ? "Please wait..."
                  : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button className="" variant="outline" onClick={onFetchOrdersForPdf}>
            <File className="mr-2 h-4 w-4" /> Prepare PDF & CSV
          </Button>
        )}

        {isGeneratingCsv ? (
          <Button className="" variant="outline" disabled>
            <Download className="mr-2 h-4 w-4 animate-spin" /> Generating CSV...
          </Button>
        ) : processedOrders.length > 0 ? (
          <Button
            className=""
            variant="outline"
            disabled={csvCooldownIds.has("customer-table-csv")}
            onClick={onCsvDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            {csvCooldownIds.has("customer-table-csv")
              ? "Please wait..."
              : "Download CSV"}
          </Button>
        ) : (
          <Button className="" variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" /> No Data
          </Button>
        )}
      </div>
    );
  },
);

ExportSection.displayName = "ExportSection";

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
  const [csvCooldownIds, setCsvCooldownIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();
  const [filterValues, setFilterValues] = useState<FilterValues>({
    product_type: null,
    brand: null,
    size: null,
    color: null,
    date_range: undefined,
  });
  const [filtersDataIsLoading, setFiltersDataIsLoading] = useState(false);
  const [filterData, setFilterData] = useState({
    product_type: [] as { id: number; name: string }[],
    brand: [] as { id: number; name: string }[],
    size: [] as { id: number; value: string }[],
    color: [] as { id: number; value: string }[],
    date_range: [] as string[],
  });

  const isResetDisabled = useMemo(() => {
    return (
      filterValues.product_type === null &&
      filterValues.brand === null &&
      filterValues.size === null &&
      filterValues.color === null &&
      filterValues.date_range === undefined
    );
  }, [filterValues]);

  const hasBrands = useMemo(() => {
    return filterValues.product_type && filterValues.product_type.id
      ? customers.some((customer) => customer.hasBrands)
      : true;
  }, [filterValues.product_type, customers]);

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
      if (filterValues.date_range?.from)
        queryParams.append(
          "date_from",
          filterValues.date_range.from.toISOString(),
        );
      if (filterValues.date_range?.to)
        queryParams.append("date_to", filterValues.date_range.to.toISOString());

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

  const handleCsvDownload = () => {
    const csvId = "customer-table-csv";

    // Check if this CSV is on cooldown
    if (csvCooldownIds.has(csvId)) {
      return;
    }

    // Add to cooldown immediately
    setCsvCooldownIds((prev) => {
      const next = new Set(prev);
      next.add(csvId);
      return next;
    });

    // Remove from cooldown after 3 seconds
    setTimeout(() => {
      setCsvCooldownIds((prev) => {
        const next = new Set(prev);
        next.delete(csvId);
        return next;
      });
    }, 3000);

    // Generate CSV content
    const headers = [
      "Name",
      "Email",
      "Contact",
      "Order ID",
      "Product Type",
      "Brand",
      "Size",
      "Color",
      "Date",
    ];

    const csvContent = [
      headers.join(","),
      ...processedOrders.map((order) =>
        [
          `"${order.customerName}"`,
          `"${order.customerEmail}"`,
          `"${order.customerContact}"`,
          `"${order.orderId !== "N/A" ? `#${order.orderId.toString().slice(-6)}` : "N/A"}"`,
          `"${order.productType}"`,
          `"${order.brand}"`,
          `"${order.size}"`,
          `"${order.color}"`,
          `"${order.date}"`,
        ].join(","),
      ),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "customer-table.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    addToast("success", "Customer CSV downloaded successfully");
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
            const brandType = order.products?.[0];

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

  const filterOrdersByValues = (orders: any[]) => {
    return orders.filter((order) => {
      const brandType = order.products?.[0];

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

      // Check date range filter
      if (filterValues.date_range?.from || filterValues.date_range?.to) {
        const orderDate = new Date(order.created_at);
        const fromDate = filterValues.date_range?.from;
        const toDate = filterValues.date_range?.to;

        if (fromDate && orderDate < fromDate) return false;
        if (toDate && orderDate > toDate) return false;
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
    filterValues.date_range,
  ]);

  // Reset ordersLoaded and close expanded rows when filters change to force refetch with new filters
  useEffect(() => {
    setExpandedRows(new Set());
    setCustomers((prev) =>
      prev.map((customer) => ({
        ...customer,
        ordersLoaded: false,
        isLoadingOrders: false,
      })),
    );
    // Reset processed orders to force PDF refresh
    setProcessedOrders([]);
  }, [
    filterValues.product_type,
    filterValues.brand,
    filterValues.size,
    filterValues.color,
    filterValues.date_range,
  ]);

  // Remove the full page loading check - let individual sections handle their own loading
  return (
    <Card className="overflow-hidden">
      <CardHeader className="max-sm:py-4 sm:py-6 ">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-2xl">
            Customer Management
          </CardTitle>
          <div className="flex gap-2">
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
              <Button
                className=""
                variant="outline"
                onClick={fetchOrdersForPdf}
                disabled={customers.length === 0}
              >
                <File className="mr-2 h-4 w-4" /> Prepare PDF & CSV
              </Button>
            )}

            {processedOrders.length > 0 && (
              <Button
                className=""
                variant="outline"
                disabled={csvCooldownIds.has("customer-table-csv")}
                onClick={handleCsvDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                {csvCooldownIds.has("customer-table-csv")
                  ? "Please wait..."
                  : "Download CSV"}
              </Button>
            )}
          </div>
        </div>
        {filtersDataIsLoading ? (
          <FiltersSkeleton />
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
            <div className="flex flex-col gap-1">
              <Label className="">Date Range</Label>
              <div className="flex items-center gap-2">
                <CalendarRange
                  date={filterValues.date_range}
                  onSelect={(date) =>
                    setFilterValues((prev) => ({
                      ...prev,
                      date_range: date,
                    }))
                  }
                />
                {(filterValues.date_range?.from ||
                  filterValues.date_range?.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() =>
                        setFilterValues((prev) => ({
                          ...prev,
                          date_range: undefined,
                        }))
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
              </div>
            </div>

            <Button
              className="ml-auto mt-auto"
              variant="outline"
              disabled={isResetDisabled}
              onClick={() =>
                setFilterValues({
                  product_type: null,
                  brand: null,
                  size: null,
                  color: null,
                  date_range: undefined,
                })
              }
            >
              <X className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="max-sm:p-0">
        {isFetchingCustomers ? (
          <CustomerTableSkeleton />
        ) : (
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
                      className="text-center py-4 text-destructive"
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
                              <h4 className="text-sm font-semibold  dark:text-white flex items-center gap-2">
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
                                    const brandType = order.products?.[0];

                                    return (
                                      <div
                                        key={order.id}
                                        className="bg-background dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                      >
                                        <div className="p-4 sm:p-6 space-y-6">
                                          {/* Product Preview Section */}
                                          <div>
                                            <div className="flex items-center justify-between content-center mb-4">
                                              <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                Product Design
                                              </h5>
                                              <div className="flex flex-col items-end gap-1.5 self-end sm:self-auto">
                                                {order.status && (
                                                  <Badge
                                                    variant="outline"
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                  >
                                                    {order.status}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            <OrderProductPreview
                                              order={{
                                                ...order,
                                                id: Number(order.id),
                                                colors: order.colors || [],
                                                product_sizes:
                                                  order.product_sizes || [],
                                                product_images:
                                                  order.product_images || [],
                                                customers: {
                                                  id: Number(customer.id),
                                                  name: customer.name,
                                                  email: customer.email,
                                                  contact_number: Number(
                                                    customer.contact_number,
                                                  ),
                                                },
                                                product_id:
                                                  Number(
                                                    order.products?.[0]?.id,
                                                  ) || 0,
                                                color_id:
                                                  Number(
                                                    order.colors?.[0]?.id,
                                                  ) || 0,
                                                invoice_no: "",
                                                document_reference_number: null,
                                                status: "pending",
                                              }}
                                            />
                                          </div>

                                          {/* Detailed Info Section */}
                                          <div className="space-y-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                                            {/* Row 1: Order Info & Customer Info */}
                                            <div className="flex flex-wrap items-center gap-3">
                                              <Badge
                                                variant="secondary"
                                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium px-3 py-1 rounded-full border-none text-[11px]"
                                              >
                                                Reference No. {order.document_types?.ref_c2} - {order.invoice_no}
                                              </Badge>
                                              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {new Date(order.created_at).toLocaleString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: true,
                                                })}
                                              </span>
                                              <Badge
                                                variant="secondary"
                                                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium px-3 py-1 rounded-full border-none text-[11px]"
                                              >
                                                {totalQuantity} items
                                              </Badge>
                                            </div>

                                            {/* Row 2: Product & Brand Info */}
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
                                              <span className="font-bold text-gray-900 dark:text-white">
                                                {brandType?.product_type?.name || "Product"}
                                              </span>
                                              <span className="text-gray-300 dark:text-gray-600">
                                                •
                                              </span>
                                              <span className="text-gray-500 dark:text-gray-400">
                                                {brandType?.brands?.name || "N/A"}
                                              </span>
                                              <span className="text-gray-300 dark:text-gray-600">
                                                •
                                              </span>
                                              <span className="text-gray-500 dark:text-gray-400">
                                                {order.colors?.[0]?.value || "N/A"}
                                              </span>
                                            </div>

                                            {/* Row 3: Sizes & Quantities */}
                                            {order.product_sizes && order.product_sizes.length > 0 && (
                                              <div className="flex justify-between align-center items-center">
                                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                                    SIZES:
                                                  </span>
                                                  <div className="flex flex-wrap gap-2">
                                                    {order.product_sizes.map((ps) => (
                                                      <Badge
                                                        key={ps.id}
                                                        variant="secondary"
                                                        className="text-[11px] font-bold px-3 py-1 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100/50 dark:border-blue-800/50 rounded-full"
                                                      >
                                                        {ps.sizes?.value || "Unknown"} ({ps.quantity})
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                </div>
                                                <div className="flex items-end gap-1.5 self-end sm:self-auto">
                                                  {order.invoice_logs &&
                                                    order.invoice_logs.map((log) => (
                                                      <Fragment key={log.id}>
                                                        <div className="flex flex-col items-center gap-2 ">
                                                          <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                          >
                                                            {log.status}
                                                          </Badge>
                                                          <span className="text-[10px] text-gray-400">
                                                            {new Date(
                                                              log.created_at,
                                                            ).toLocaleString("en-US", {
                                                              month: "short",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                            })}
                                                          </span>
                                                        </div>
                                                      </Fragment>
                                                    ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )
                              }
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
        )}
      </CardContent>
    </Card >
  );
}
