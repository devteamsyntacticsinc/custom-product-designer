import { supabase } from "@/lib/supabase";
import { OrderData, OrderResult } from "@/types/product";
import {
  OrderWithCustomer,
  CustomerActivity,
  ActivityItem,
  RecentActivity,
  OrderWithInvoice,
  OrderInDrawer,
} from "@/types/order";
import { CustomerWithOrdersForDashboard } from "@/types/customer";

export class OrderService {
  static async createCustomer(
    contactInformation: OrderData["contactInformation"],
  ): Promise<OrderResult["customerData"]> {
    try {
      // First, check if a customer with this email already exists
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id, name, email, contact_number, address")
        .eq("email", contactInformation.email)
        .single();

      // If customer exists, return the existing customer data
      if (existingCustomer) {
        // Optionally update customer information if it has changed
        const needsUpdate =
          existingCustomer.name !== contactInformation.fullName ||
          existingCustomer.contact_number !==
            contactInformation.contactNumber ||
          existingCustomer.address !== contactInformation.address;

        if (needsUpdate) {
          const { data: updatedCustomer } = await supabase
            .from("customers")
            .update({
              name: contactInformation.fullName,
              contact_number: contactInformation.contactNumber,
              address: contactInformation.address,
            })
            .eq("id", existingCustomer.id)
            .select()
            .single();

          console.log("Existing customer updated:", updatedCustomer.email);
          return updatedCustomer;
        }

        return existingCustomer;
      }

      // If no existing customer, create a new one
      const { data } = await supabase
        .from("customers")
        .insert({
          name: contactInformation.fullName,
          email: contactInformation.email,
          contact_number: contactInformation.contactNumber,
          address: contactInformation.address,
        })
        .select()
        .single();

      console.log("New customer created:", data.email);
      return data;
    } catch (error) {
      console.error("Error creating/fetching customer:", error);
      throw error;
    }
  }

  static async getBrandTypeId(
    brandId: string | null,
    typeId: string,
  ): Promise<{ id: string }> {
    try {
      const { data, error } = await supabase
        .from("brand_type")
        .select("id")
        .eq("brand_id", brandId)
        .eq("type_id", typeId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching brand type ID:", error);
      throw error;
    }
  }

  static async getDocumentTypeIdByRef(
    refCode: string,
  ): Promise<{ id: string }> {
    try {
      const { data, error } = await supabase
        .from("document_types")
        .select("id")
        .eq("ref_c2", refCode)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching document type ID:", error);
      throw error;
    }
  }

  static async generateInvoiceRefNo(): Promise<string> {
    try {
      // Get the current highest invoice number
      const { data: lastInvoice } = await supabase
        .from("invoices")
        .select("ref_no")
        .like("ref_no", "%")
        .order("ref_no", { ascending: false })
        .limit(1)
        .single();

      let nextNumber = 1;

      if (lastInvoice) {
        // Extract the numeric part - handle both INV-000001 and 000001 formats
        const numericPart = lastInvoice.ref_no.replace("INV-", "");
        const currentNumber = parseInt(numericPart);
        nextNumber = currentNumber + 1;
      }

      // Format as 000001 (6 digits with leading zeros)
      return nextNumber.toString().padStart(6, "0");
    } catch (error) {
      console.error("Error generating invoice reference number:", error);
      throw error;
    }
  }

  static async createInvoice(
    customerId: string,
  ): Promise<{ id: string; ref_no: string }> {
    try {
      // Get document type ID for 'IN'
      const documentType = await this.getDocumentTypeIdByRef("ORD");

      // Generate invoice reference number
      const refNo = await this.generateInvoiceRefNo();

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          customer_id: customerId,
          document_type_id: documentType.id,
          ref_no: refNo,
        })
        .select("id, ref_no")
        .single();

      if (error) {
        throw error;
      }

      // Insert into invoices_status table with status_id = 1
      const { error: statusError } = await supabase
        .from("invoices_status")
        .insert({
          invoice_id: data.id,
          status_id: 1,
        });

      if (statusError) {
        throw statusError;
      }

      return data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  static async getInvoiceByProductOrderId(productOrderId: string): Promise<{
    id: string;
    ref_no: string;
    customer_id: string;
    status: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("product_orders")
        .select(
          `
          invoice_id,
          invoices (
            id,
            ref_no,
            customer_id,
            status
          )
        `,
        )
        .eq("id", productOrderId)
        .single();

      if (error) {
        throw error;
      }

      if (!data || !data.invoices || data.invoices.length === 0) {
        throw new Error("Invoice not found for product order");
      }

      return data.invoices[0] as {
        id: string;
        ref_no: string;
        customer_id: string;
        status: string;
      };
    } catch (error) {
      console.error("Error fetching invoice by product order ID:", error);
      throw error;
    }
  }

  static async createProductOrder(
    invoiceId: string,
    brandTypeId: string,
    colorId: string | null,
  ): Promise<OrderResult["productOrderData"]> {
    try {
      const { data, error } = await supabase
        .from("product_orders")
        .insert({
          invoice_id: invoiceId,
          brandT_id: brandTypeId,
          color_id: colorId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error creating product order:", error);
      throw error;
    }
  }

  static async createProductSizes(
    productOrderId: string,
    sizeSelection: OrderData["sizeSelection"],
  ) {
    try {
      const sizeInserts = sizeSelection
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          productO_id: productOrderId,
          size_id: item.size,
          quantity: item.quantity,
        }));

      if (sizeInserts.length > 0) {
        const { error } = await supabase
          .from("product_sizes")
          .insert(sizeInserts);

        if (error) {
          console.error("Error creating product sizes:", error);
          throw error;
        }

        return true;
      }

      return true;
    } catch (error) {
      console.error("Error creating product sizes:", error);
      throw error;
    }
  }

  static async uploadProductImages(
    productOrderId: string,
    assets: OrderData["assets"],
  ) {
    try {
      const placementMap: Record<string, string> = {
        "front-top-left": "Front - Top Left",
        "front-center": "Front - Center",
        "back-top": "Back - Top",
        "back-bottom": "Back - Bottom",
      };

      const imageInserts = [];
      for (const [key, file] of Object.entries(assets)) {
        if (file && file instanceof File) {
          // Upload to Supabase Storage
          const fileName = `${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          imageInserts.push({
            productO_id: productOrderId,
            url: urlData.publicUrl,
            place: placementMap[key] || key,
          });
        }
      }

      if (imageInserts.length > 0) {
        const { error } = await supabase
          .from("product_images")
          .insert(imageInserts);

        if (error) {
          console.error("Error inserting product images:", error);
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error("Error uploading product images:", error);
      throw error;
    }
  }

  static async processOrder(
    orderData: OrderData,
  ): Promise<OrderResult & { invoiceRefNo: string }> {
    try {
      // Create customer
      const customerData = await this.createCustomer(
        orderData.contactInformation,
      );

      // Create invoice
      const invoiceData = await this.createInvoice(customerData.id);

      // Always get brand type ID for the product type
      // If brandId exists, use it to find the specific brand type
      // If no brandId (is_onlyType), find any brand type for this product type
      let brandTypeId: string;

      if (orderData.brandId) {
        const brandTypeData = await this.getBrandTypeId(
          orderData.brandId,
          orderData.productTypeId,
        );
        brandTypeId = brandTypeData.id;
      } else {
        // For is_onlyType products, find any brand type for this product type
        const { data: defaultBrandType } = await supabase
          .from("brand_type")
          .select("id")
          .eq("type_id", orderData.productTypeId)
          .limit(1)
          .single();

        if (!defaultBrandType) {
          throw new Error("No brand type found for this product type");
        }

        brandTypeId = defaultBrandType.id;
      }

      // Create product order - now uses invoice_id instead of customer_id
      const productOrderData = await this.createProductOrder(
        invoiceData.id,
        brandTypeId,
        orderData.colorId,
      );

      // Create product sizes
      await this.createProductSizes(
        productOrderData.id,
        orderData.sizeSelection,
      );

      // Upload product images
      await this.uploadProductImages(productOrderData.id, orderData.assets);

      return {
        customerData,
        productOrderData,
        invoiceRefNo: invoiceData.ref_no,
      };
    } catch (error) {
      console.error("Error processing order:", error);
      throw error;
    }
  }

  static async getProductOrdersCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("product_orders")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error fetching product orders count:", error);
      return 0;
    }
  }

  static async getCustomersCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error fetching customers count:", error);
      return 0;
    }
  }

  static async getRecentActivity(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    activities: ActivityItem[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      // Get all customers
      const { data: allCustomers, error: customersError } = await supabase
        .from("customers")
        .select("id, name, email, contact_number, created_at")
        .order("created_at", { ascending: false });

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        return {
          activities: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        };
      }

      // Get all orders
      const { data: allOrders, error: ordersError } = await supabase
        .from("product_orders")
        .select(
          `
          id,
          created_at,
          invoices (
            id,
            customer_id,
            customers (
              id,
              name,
              email,
              contact_number
            ),
            document_types (id, ref_c2, description),
            ref_no
          )
        `,
        )
        .order("created_at", { ascending: false })
        .overrideTypes<RecentActivity[]>();
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return {
          activities: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        };
      }

      // Transform orders to include customer information for buildActivityFromOrders
      const transformedOrders = allOrders.map((order) => {
        const customer = order.invoices?.customers;
        return {
          ...order,
          customers: customer || null,
        };
      });

      const allActivities = this.buildActivityFromOrders(
        transformedOrders,
        allCustomers || [],
      );

      const total = allActivities.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedActivities = allActivities.slice(startIndex, endIndex);

      return {
        activities: paginatedActivities,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return {
        activities: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
      };
    }
  }

  static async getAllOrders(): Promise<OrderWithCustomer[]> {
    try {
      // First, get basic orders with invoice information
      const { data: orders, error: ordersError } = await supabase
        .from("product_orders")
        .select(
          `
          id,
          created_at,
          invoice_id,
          brandT_id,
          color_id,
          invoices (
            id,
            customer_id,
            customers (
              id,
              name,
              email,
              contact_number
            ),
            document_types (
              id,
              ref_c2,
              description
            ),
            ref_no
          )
        `,
        )
        .order("created_at", { ascending: false })
        .overrideTypes<OrderWithInvoice[]>();

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return [];
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      // Get brand type information
      const brandTypeIds = orders
        .map((order) => order.brandT_id)
        .filter(Boolean);

      const { data: brandTypes, error: brandTypesError } = await supabase
        .from("brand_type")
        .select(
          `
          id,
          brand_id,
          type_id,
          brands (id, name),
          product_type (id, name, is_onlyType, image_products (filepath, is_hasBack))
        `,
        )
        .in("id", brandTypeIds);

      if (brandTypesError) {
        console.error("Error fetching brand types:", brandTypesError);
      }

      // Get color information
      const colorIds = orders.map((order) => order.color_id).filter(Boolean);
      const { data: colors, error: colorsError } = await supabase
        .from("colors")
        .select("id, value")
        .in("id", colorIds);

      if (colorsError) {
        console.error("Error fetching colors:", colorsError);
      }

      // Get product sizes for each order
      const { data: productSizes, error: sizesError } = await supabase
        .from("product_sizes")
        .select(
          `
          id,
          productO_id,
          size_id,
          quantity,
          sizes (id, value)
        `,
        )
        .in(
          "productO_id",
          orders.map((order) => order.id),
        );

      if (sizesError) {
        console.error("Error fetching product sizes:", sizesError);
      }

      // Get product images for each order
      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("id, productO_id, url, place")
        .in(
          "productO_id",
          orders.map((order) => order.id),
        );

      if (imagesError) {
        console.error("Error fetching product images:", imagesError);
      }

      // Combine all data
      const combinedOrders = orders.map((order) => {
        const customer = order.invoices?.customers;
        const brandType = brandTypes?.find((bt) => bt.id === order.brandT_id);
        const color = colors?.find((c) => c.id === order.color_id);
        const sizes = productSizes?.filter((ps) => ps.productO_id === order.id);
        const images = productImages?.filter(
          (pi) => pi.productO_id === order.id,
        );

        // Ensure sizes is properly formatted
        const formattedSizes = sizes?.map((size) => ({
          ...size,
          sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes,
        }));

        const transformedBrandType = brandType
          ? [
              {
                id: brandType.id,
                brands: Array.isArray(brandType.brands)
                  ? brandType.brands[0]
                  : brandType.brands || undefined,
                product_type: Array.isArray(brandType.product_type)
                  ? brandType.product_type[0]
                  : brandType.product_type || undefined,
              },
            ]
          : [];

        return {
          ...order,
          customers: customer || null,
          brand_type: transformedBrandType,
          colors: color ? [color] : [],
          product_sizes: formattedSizes || [],
          product_images: images || [],
        };
      });

      return combinedOrders;
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      return [];
    }
  }

  private static buildActivityFromOrders(
    recentOrders: OrderWithCustomer[],
    recentCustomers: CustomerActivity[],
  ): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // Add order activities
    if (recentOrders) {
      recentOrders.forEach((order) => {
        const customer = Array.isArray(order.customers)
          ? order.customers[0]
          : order.customers;
        activities.push({
          id: `order-${order.id}`,
          type: "order" as const,
          title: "New order received",
          description: `Reference No. ${order.invoices?.document_types?.ref_c2} - ${order.invoices?.ref_no} - ${customer?.name || "Unknown Customer"}`,
          timestamp: order.created_at,
        });
      });
    }

    // Add customer activities
    if (recentCustomers) {
      recentCustomers.forEach((customer) => {
        activities.push({
          id: `user-${customer.id}`,
          type: "user" as const,
          title: "New user registered",
          description: customer.email,
          timestamp: customer.created_at,
        });
      });
    }

    // Sort by timestamp (newest first) and return all activities
    return activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  // Get all orders for a specific customer
  static async getOrdersByCustomerId(
    customerId: number,
  ): Promise<CustomerWithOrdersForDashboard> {
    try {
      // Fetch customer details first
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id, name, email, contact_number")
        .eq("id", customerId)
        .single();

      if (customerError) {
        console.error("Error fetching customer:", customerError);
        return { customer: null, orders: [] };
      }

      if (!customer) {
        return { customer: null, orders: [] };
      }

      // Fetch all orders for the customer through invoices
      const { data: orders, error: ordersError } = await supabase
        .from("product_orders")
        .select(
          `
          id,
          created_at,
          invoice_id,
          brandT_id,
          color_id,
          invoices!inner (
            customer_id
          )
        `,
        )
        .eq("invoices.customer_id", customerId)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return { customer, orders: [] };
      }

      if (!orders || orders.length === 0) {
        return { customer, orders: [] };
      }

      // Get all brand type IDs from orders
      const brandTypeIds = orders
        .map((order) => order.brandT_id)
        .filter(Boolean);

      // Fetch brand type details for all orders
      const { data: brandTypes, error: brandTypesError } = await supabase
        .from("brand_type")
        .select(
          `
          id,
          brand_id,
          type_id,
          brands (id, name),
          product_type (id, name, is_onlyType, image_products (filepath, is_hasBack))
        `,
        )
        .in("id", brandTypeIds);

      if (brandTypesError) {
        console.error("Error fetching brand types:", brandTypesError);
      }

      // Get all color IDs from orders
      const colorIds = orders.map((order) => order.color_id).filter(Boolean);

      // Fetch color details for all orders
      const { data: colors, error: colorsError } = await supabase
        .from("colors")
        .select("id, value")
        .in("id", colorIds);

      if (colorsError) {
        console.error("Error fetching colors:", colorsError);
      }

      // Fetch product sizes for all orders
      const { data: productSizes, error: sizesError } = await supabase
        .from("product_sizes")
        .select(
          `
          id,
          productO_id,
          size_id,
          quantity,
          sizes (id, value)
        `,
        )
        .in(
          "productO_id",
          orders.map((order) => order.id),
        );

      if (sizesError) {
        console.error("Error fetching product sizes:", sizesError);
      }

      // Fetch product images for all orders
      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("id, productO_id, url, place")
        .in(
          "productO_id",
          orders.map((order) => order.id),
        );

      if (imagesError) {
        console.error("Error fetching product images:", imagesError);
      }

      // Combine all data for each order
      const combinedOrders = orders.map((order) => {
        const brandType = brandTypes?.find((bt) => bt.id === order.brandT_id);
        const color = colors?.find((c) => c.id === order.color_id);
        const sizes = productSizes?.filter((ps) => ps.productO_id === order.id);
        const images = productImages?.filter(
          (pi) => pi.productO_id === order.id,
        );

        // Ensure sizes is properly formatted
        const formattedSizes = sizes?.map((size) => ({
          ...size,
          sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes,
        }));

        const transformedBrandType = brandType
          ? [
              {
                id: brandType.id,
                brands: Array.isArray(brandType.brands)
                  ? brandType.brands[0]
                  : brandType.brands || undefined,
                product_type: Array.isArray(brandType.product_type)
                  ? brandType.product_type[0]
                  : brandType.product_type || undefined,
              },
            ]
          : [];

        return {
          id: order.id,
          created_at: order.created_at,
          brand_type: transformedBrandType,
          colors: color ? [color] : [],
          product_sizes: formattedSizes || [],
          product_images: images || [],
        };
      });

      return {
        customer,
        orders: combinedOrders,
      };
    } catch (error) {
      console.error("Error fetching orders by customer ID:", error);
      return { customer: null, orders: [] };
    }
  }

  // Get order details by id
  static async getOrderById(orderId: number): Promise<OrderWithCustomer> {
    try {
      // First, get the specific order with invoice information
      const { data: orders, error: ordersError } = await supabase
        .from("product_orders")
        .select(
          `
          id,
          created_at,
          invoice_id,
          brandT_id,
          color_id,
          invoices (
            id,
            customer_id,
            customers (
              id,
              name,
              email,
              contact_number
            ),
            document_types (
              id,
              ref_c2,
              description
            ),
            ref_no
          )
        `,
        )
        .eq("id", orderId)
        .single()
        .overrideTypes<OrderInDrawer>();

      if (ordersError) {
        console.error("Error fetching order:", ordersError);
        return {} as OrderWithCustomer;
      }

      if (!orders) {
        return {} as OrderWithCustomer;
      }

      // Get brand type information
      const { data: brandTypes, error: brandTypesError } = await supabase
        .from("brand_type")
        .select(
          `
          id,
          brand_id,
          type_id,
          brands (id, name),
          product_type (id, name, is_onlyType, image_products (filepath, is_hasBack))
        `,
        )
        .eq("id", orders.brandT_id);

      if (brandTypesError) {
        console.error("Error fetching brand types:", brandTypesError);
      }

      // Get color information
      const { data: colors, error: colorsError } = await supabase
        .from("colors")
        .select("id, value")
        .eq("id", orders.color_id);

      if (colorsError) {
        console.error("Error fetching colors:", colorsError);
      }

      // Get product sizes for the order
      const { data: productSizes, error: sizesError } = await supabase
        .from("product_sizes")
        .select(
          `
          id,
          productO_id,
          size_id,
          quantity,
          sizes (id, value)
        `,
        )
        .eq("productO_id", orders.id);

      if (sizesError) {
        console.error("Error fetching product sizes:", sizesError);
      }

      // Get product images for the order
      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("id, productO_id, url, place")
        .eq("productO_id", orders.id);

      if (imagesError) {
        console.error("Error fetching product images:", imagesError);
      }

      // Combine all data
      const customer = orders.invoices?.customers;
      const brandType = brandTypes?.[0];
      const color = colors?.[0];

      // Ensure sizes is properly formatted
      const formattedSizes = productSizes?.map((size) => ({
        ...size,
        sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes,
      }));

      const transformedBrandType = brandType
        ? [
            {
              id: brandType.id,
              brands: Array.isArray(brandType.brands)
                ? brandType.brands[0]
                : brandType.brands || undefined,
              product_type: Array.isArray(brandType.product_type)
                ? brandType.product_type[0]
                : brandType.product_type || undefined,
            },
          ]
        : [];

      return {
        ...orders,
        customers: customer as {
          id: string;
          name: string;
          email: string;
          contact_number: string;
        },
        brand_type: transformedBrandType,
        colors: color ? [color] : [],
        product_sizes: formattedSizes || [],
        product_images: productImages || [],
      };
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      return {} as OrderWithCustomer;
    }
  }
}
