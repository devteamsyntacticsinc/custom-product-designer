"use client";

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
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Label } from "./ui/label";

type FilterValues = {
  product_type: string;
  brand: string;
  size: string;
  color: string;
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
  const [filterValues, setFilterValues] = useState<FilterValues>({
    product_type: "",
    brand: "",
    size: "",
    color: "",
    date_range: "",
  });
  console.log(filterValues);

  const fetchCustomers = async () => {
    try {
      setError(null);
      setIsFetchingCustomers(true);
      const data = await CustomerService.getCustomers();
      setCustomers(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsFetchingCustomers(false);
    }
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
      const orders = await CustomerService.getCustomerOrders(customerId);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? { ...c, orders, isLoadingOrders: false, ordersLoaded: true }
            : c,
        ),
      );
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, isLoadingOrders: false } : c,
        ),
      );
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  if (isFetchingCustomers) {
    return <CustomerPageSkeleton />;
  }
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-4 sm:py-6 ">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-2xl">
            Customer Management
          </CardTitle>
          <Button className="" variant="outline">
            <File className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full mt-4 overflow-y-auto">
          {/* Product type */}

          <ComboboxComponent
            placeholder="Product Type"
            label="Product Type"
            filterKey="product_type"
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          />

          {/* brand */}
          <ComboboxComponent
            placeholder="Brand"
            label="Brand"
            filterKey="brand"
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          />

          {/* size */}
          <ComboboxComponent
            placeholder="Size"
            label="Size"
            filterKey="size"
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          />

          {/* Color */}
          <ComboboxComponent
            placeholder="Color"
            label="Color"
            filterKey="color"
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          />

          {/* Date Range */}
          <ComboboxComponent
            placeholder="Date Range"
            label="Date Range"
            filterKey="date_range"
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          />

          <Button
            className="ml-auto mt-auto"
            variant="outline"
            disabled={
              filterValues.product_type === "" &&
              filterValues.brand === "" &&
              filterValues.size === "" &&
              filterValues.color === "" &&
              filterValues.date_range === ""
            }
            onClick={() =>
              setFilterValues({
                product_type: "",
                brand: "",
                size: "",
                color: "",
                date_range: "",
              })
            }
          >
            <X className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
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
                                              <div className="space-y-2">
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

function ComboboxComponent({
  placeholder,
  label,
  filterKey,
  filterValues,
  setFilterValues,
}: {
  placeholder: string;
  label: string;
  filterKey: keyof FilterValues;
  filterValues: FilterValues;
  setFilterValues: React.Dispatch<React.SetStateAction<FilterValues>>;
}) {
  const frameworks = [
    "Next.js",
    "SvelteKit",
    "Nuxt.js",
    "Remix",
    "Astro",
  ] as const;
  const anchor = useComboboxAnchor();

  return (
    <div>
      <Label className="">{label}</Label>
      <Combobox
        autoHighlight
        items={frameworks}
        value={filterValues[filterKey]}
        onValueChange={(value) =>
          setFilterValues((prev: FilterValues) => ({
            ...prev,
            [filterKey]: value,
          }))
        }
      >
        <ComboboxChips ref={anchor} className="w-full max-w-xs relative mt-2">
          <ComboboxValue>
            <ComboboxChipsInput placeholder={`Select ${placeholder}`} />
            <ChevronDown className="size-4 absolute right-2" />
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {frameworks.map((item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
