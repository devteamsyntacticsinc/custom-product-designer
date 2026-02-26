import { StyleSheet } from "@react-pdf/renderer";

export const receiptStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottom: "2pt solid #000",
    paddingBottom: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    borderBottom: "1pt solid #e5e7eb",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
    color: "#4b5563",
  },
  value: {
    width: "70%",
    color: "#1f2937",
  },
  productSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  productImage: {
    width: 150,
    height: 150,
    objectFit: "contain",
    marginBottom: 10,
  },
  mockupContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 20,
  },
  designOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  designImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  sizeTable: {
    flexDirection: "column",
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e5e7eb",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: "1pt solid #e5e7eb",
    paddingTop: 10,
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
  },
  badge: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "2pt 6pt",
    borderRadius: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  totalSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
    border: "1pt solid #0ea5e9",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontWeight: "bold",
    color: "#0c4a6e",
  },
  totalValue: {
    fontWeight: "bold",
    color: "#0c4a6e",
  },
});