"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import CustomerTableReceipt from "@/app/components/receipts/CustomerTableReceipt";
import axios from "axios";

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

// Sample data for testing
const sampleCustomers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    contact_number: "123-456-7890",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    contact_number: "987-654-3210",
  },
];

const sampleFilterValues = {
  product_type: { id: 1, name: "T-Shirt" },
  brand: { id: 1, name: "Nike" },
  size: { id: 1, value: "L" },
  color: { id: 1, value: "Red" },
  date_range: "Last 30 days",
};

export default function Page() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [processedOrders, setProcessedOrders] = useState<ProcessedOrderRow[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrdersAndGeneratePdf = async () => {
    setIsLoading(true);
    const allOrderRows: ProcessedOrderRow[] = [];

    try {
      // Fetch orders for each customer
      for (const customer of sampleCustomers) {
        try {
          const response = await axios.get(
            `/api/customers/${customer.id.toString()}`,
          );
          const customerOrders = response.data.data;

          // Process each order to create individual rows
          customerOrders.forEach((order: any) => {
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

      // Generate PDF
      const blob = await pdf(
        <CustomerTableReceipt
          processedOrders={allOrderRows}
          filterValues={sampleFilterValues}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Customer Table PDF Test</h1>

      <div className="space-y-4">
        <button
          onClick={fetchOrdersAndGeneratePdf}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Generating PDF..." : "Generate PDF Preview"}
        </button>

        {pdfUrl && (
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">PDF Preview</h2>
            <iframe
              src={pdfUrl}
              className="w-full h-[600px] border rounded"
              title="Customer Table PDF Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
