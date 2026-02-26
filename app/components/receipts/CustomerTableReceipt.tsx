import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { receiptStyles as styles } from "./styles";

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

interface CustomerTableReceiptProps {
  processedOrders: ProcessedOrderRow[];
  filterValues: {
    product_type: { id: number; name: string } | null;
    brand: { id: number; name: string } | null;
    size: { id: number; value: string } | null;
    color: { id: number; value: string } | null;
    date_range: string;
  };
}

export default function CustomerTableReceipt({
  processedOrders,
  filterValues,
}: CustomerTableReceiptProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActiveFilters = () => {
    const filters = [];
    if (filterValues.product_type)
      filters.push(`Product: ${filterValues.product_type.name}`);
    if (filterValues.brand) filters.push(`Brand: ${filterValues.brand.name}`);
    if (filterValues.size) filters.push(`Size: ${filterValues.size.value}`);
    if (filterValues.color) filters.push(`Color: ${filterValues.color.value}`);
    if (filterValues.date_range)
      filters.push(`Date Range: ${filterValues.date_range}`);
    return filters.length > 0 ? filters : ["All Customers"];
  };

  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Customer Report</Text>
          <Text style={styles.subtitle}>Filtered Customer Data Report</Text>
        </View>

        {/* Active Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Filters</Text>
          {getActiveFilters().map((filter, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.value}>{filter}</Text>
            </View>
          ))}
        </View>

        {/* Customer Orders Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Orders Data</Text>
          <View style={customerStyles.tableContainer}>
            {/* Table Header */}
            <View style={[customerStyles.tableRow, customerStyles.tableHeader]}>
              <Text style={customerStyles.tableCellSmall}>Name</Text>
              <Text style={customerStyles.tableCell}>Email</Text>
              <Text style={customerStyles.tableCell}>Contact</Text>
              <Text style={customerStyles.tableCellSmall}>Order ID</Text>
              <Text style={customerStyles.tableCell}>Product Type</Text>
              <Text style={customerStyles.tableCell}>Brand</Text>
              <Text style={customerStyles.tableCellSmall}>Size</Text>
              <Text style={customerStyles.tableCellSmall}>Color</Text>
              <Text style={customerStyles.tableCell}>Date</Text>
            </View>

            {/* Table Rows */}
            {processedOrders.map((orderRow, index) => (
              <View
                key={`${orderRow.customerId}-${orderRow.orderId}-${index}`}
                style={customerStyles.tableRow}
              >
                <Text style={customerStyles.tableCellSmall}>
                  {orderRow.customerName}
                </Text>
                <Text style={customerStyles.tableCell}>
                  {orderRow.customerEmail}
                </Text>
                <Text style={customerStyles.tableCell}>
                  {orderRow.customerContact}
                </Text>
                <Text style={customerStyles.tableCellSmall}>
                  {orderRow.orderId !== "N/A"
                    ? `#${orderRow.orderId.toString().slice(-6)}`
                    : "N/A"}
                </Text>
                <Text style={customerStyles.tableCell}>
                  {orderRow.productType}
                </Text>
                <Text style={customerStyles.tableCell}>{orderRow.brand}</Text>
                <Text style={customerStyles.tableCellSmall}>
                  {orderRow.size}
                </Text>
                <Text style={customerStyles.tableCellSmall}>
                  {orderRow.color}
                </Text>
                <Text style={customerStyles.tableCell}>{orderRow.date}</Text>
              </View>
            ))}

            {processedOrders.length === 0 && (
              <View style={customerStyles.tableRow}>
                <Text
                  style={[
                    customerStyles.tableCell,
                    { textAlign: "center", flex: 1 },
                  ]}
                >
                  No orders found matching the current filters.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Customers:</Text>
            <Text style={styles.value}>
              {new Set(processedOrders.map((order) => order.customerId)).size}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Orders:</Text>
            <Text style={styles.value}>{processedOrders.length}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Customer Report Generated</Text>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>Print Pro Custom Product Designer</Text>
        </View>
      </Page>
    </Document>
  );
}

// Additional styles specific to customer table
const customerStyles = StyleSheet.create({
  tableContainer: {
    flexDirection: "column",
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e5e7eb",
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 2,
    padding: 6,
    fontSize: 9,
    borderRight: "1pt solid #e5e7eb",
  },
  tableCellSmall: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    borderRight: "1pt solid #e5e7eb",
  },
});
