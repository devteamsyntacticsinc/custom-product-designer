import { Document, Page, Text, View, Image, Font } from "@react-pdf/renderer";
import { OrderWithCustomer } from "@/types/order";
import { receiptStyles as styles } from "./styles";
import axios from "axios";

// Register fonts (optional - you can use default fonts)
Font.register({
  family: "Helvetica",
  src: "https://fonts.googleapis.com/css2?family=Helvetica:wght@400;700&display=swap",
});

interface OrderReceiptPDFProps {
  order: OrderWithCustomer;
}

interface CustomStyle {
  top?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
  [key: string]: any;
}

// Design area component for PDF
const DesignAreaPDF = ({
  placement,
  imageUrl,
  customStyle,
}: {
  placement: string;
  imageUrl?: string;
  customStyle: CustomStyle;
}) => {
  const normalizedImageUrl = imageUrl
    ? normalizeImageUrlForPdf(imageUrl)
    : undefined;
  return (
    <View style={[styles.designOverlay, customStyle]}>
      {normalizedImageUrl ? (
        <Image src={normalizedImageUrl} style={styles.designImage} />
      ) : (
        <Text style={{ fontSize: 6, color: "#9ca3af", textAlign: "center" }}>
          {placement}
        </Text>
      )}
    </View>
  );
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const convertWebpBlobToJpegBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!(blob instanceof Blob)) {
      reject(new Error("Invalid input: Expected a Blob object"));
      return;
    }

    // Use browser's HTMLImageElement, not React PDF Image
    const img = document.createElement("img") as HTMLImageElement;
    const objectUrl = URL.createObjectURL(blob);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          reject(new Error("Canvas not supported."));
          return;
        }

        // Fill with white background for JPEG compatibility
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0);

        const jpegBase64 = canvas.toDataURL("image/jpeg", 0.85);

        cleanup();
        resolve(jpegBase64);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error("Failed to load WebP image."));
    };

    img.src = objectUrl;
  });
};

export const normalizeImageUrlForPdf = async (
  imageUrl: string,
): Promise<string> => {
  // Fetch the image
  const response = await axios.get(imageUrl, { responseType: "blob" });
  if (!response.data) {
    throw new Error("Failed to fetch image.");
  }

  const blob = response.data;

  // Convert blob to base64
  const base64 = await blobToBase64(blob);

  // If not WebP → return original base64
  if (blob.type !== "image/webp") {
    return base64;
  }

  // If WebP → convert via canvas
  return await convertWebpBlobToJpegBase64(blob);
};

export default function OrderReceiptPDF({ order }: OrderReceiptPDFProps) {
  const customer = Array.isArray(order.customers)
    ? order.customers[0]
    : order.customers;
  const totalQuantity =
    order.product_sizes?.reduce(
      (total, size) => total + (size.quantity || 0),
      0,
    ) || 0;

  // Get product images
  const productTypeImages =
    order.products?.[0]?.product_type?.image_products || [];
  const frontImage = productTypeImages.find((img) => img.is_hasBack === false);
  const backImage = productTypeImages.find((img) => img.is_hasBack === true);
  const isOnlyType = order.products?.[0]?.product_type?.is_onlyType || false;

  // Create a record of images by placement using exact database values
  const imagesByPlacement: Record<string, string> = {};
  order.product_images?.forEach((img) => {
    imagesByPlacement[img.place] = img.url;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Print Pro Order Receipt</Text>
          <Text style={styles.subtitle}>Custom Product Design Receipt</Text>
        </View>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>
              Reference No. {order.document_types?.ref_c2} - {order.invoice_no}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Date:</Text>
            <Text style={styles.value}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.badge}>
              <Text>Processing</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          {customer ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{customer.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{customer.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Contact:</Text>
                <Text style={styles.value}>{customer.contact_number}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.value}>Customer information unavailable</Text>
          )}
        </View>

        {/* Product Details with Design Areas */}
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Product Design Preview</Text>

          {/* T-shirt Mockups with Design Areas */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 15,
            }}
          >
            {/* Front View */}
            {frontImage && (
              <View style={styles.mockupContainer}>
                <Image src={frontImage.filepath} style={styles.productImage} />
                <Text
                  style={{ fontSize: 8, color: "#6b7280", textAlign: "center" }}
                >
                  Front View
                </Text>

                {/* Design Areas Overlay */}
                {isOnlyType ? (
                  // Only type - Center area (like Mug positioning)
                  <DesignAreaPDF
                    placement="Front - Center"
                    imageUrl={imagesByPlacement["Front - Center"]}
                    customStyle={{
                      top: "31%",
                      left: "29%",
                      width: "30%",
                      height: "33%",
                    }}
                  />
                ) : (
                  // Regular T-shirt - Multiple areas
                  <>
                    <DesignAreaPDF
                      placement="Front - Top Left"
                      imageUrl={imagesByPlacement["Front - Top Left"]}
                      customStyle={{
                        top: "23%",
                        left: "60%",
                        width: "10%",
                        height: "10%",
                      }}
                    />
                    <DesignAreaPDF
                      placement="Front - Center"
                      imageUrl={imagesByPlacement["Front - Center"]}
                      customStyle={{
                        top: "38%",
                        left: "33%",
                        width: "35%",
                        height: "35%",
                      }}
                    />
                  </>
                )}
              </View>
            )}

            {/* Back View */}
            {backImage && !isOnlyType && (
              <View style={styles.mockupContainer}>
                <Image src={backImage.filepath} style={styles.productImage} />
                <Text
                  style={{ fontSize: 8, color: "#6b7280", textAlign: "center" }}
                >
                  Back View
                </Text>

                {/* Back Design Areas */}
                <DesignAreaPDF
                  placement="Back - Top"
                  imageUrl={imagesByPlacement["Back - Top"]}
                  customStyle={{
                    top: "20%",
                    left: "43%",
                    width: "12%",
                    height: "12%",
                  }}
                />
                <DesignAreaPDF
                  placement="Back - Bottom"
                  imageUrl={imagesByPlacement["Back - Bottom"]}
                  customStyle={{
                    top: "70%",
                    left: "33%",
                    width: "35%",
                    height: "9%",
                  }}
                />
              </View>
            )}
            {!frontImage && !backImage && (
              <View style={styles.mockupContainer}>
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  No image designs available yet.
                </Text>
              </View>
            )}
          </View>

          {/* Product Information */}
          <View style={styles.row}>
            <Text style={styles.label}>Product Type:</Text>
            <Text style={styles.value}>
              {order.products?.[0]?.product_type?.name || "Unknown"}
            </Text>
          </View>

          {!isOnlyType && order.products?.[0]?.brands?.name && (
            <View style={styles.row}>
              <Text style={styles.label}>Brand:</Text>
              <Text style={styles.value}>{order.products[0].brands.name}</Text>
            </View>
          )}

          {order.colors?.[0]?.value && (
            <View style={styles.row}>
              <Text style={styles.label}>Color:</Text>
              <Text style={styles.value}>{order.colors[0].value}</Text>
            </View>
          )}
        </View>

        {/* Size and Quantity Table */}
        {order.product_sizes && order.product_sizes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Size and Quantity</Text>
            <View style={styles.sizeTable}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Size</Text>
                <Text style={styles.tableCell}>Quantity</Text>
              </View>
              {/* Table Rows */}
              {order.product_sizes.map((size) => (
                <View key={size.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {size.sizes?.value || "Unknown"}
                  </Text>
                  <Text style={styles.tableCell}>{size.quantity}</Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Items:</Text>
                <Text style={styles.totalValue}>{totalQuantity}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Design Areas */}
        {order.product_images && order.product_images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Design Areas</Text>
            {order.product_images.map((image) => {
              const fileName = image.url?.split("/").pop();

              return (
                <View key={image.id} style={styles.row}>
                  <Text style={styles.label}>{image.place}:</Text>
                  <Text style={styles.value}>{fileName}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing Print Pro!</Text>
          <Text>
            This receipt was generated on {new Date().toLocaleDateString()}
          </Text>
          <Text>For inquiries, please contact our customer support.</Text>
        </View>
      </Page>
    </Document>
  );
}
