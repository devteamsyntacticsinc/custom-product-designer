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
        .from("products")
        .select("id")
        .eq("brand_id", brandId)
        .eq("product_type_id", typeId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching product ID:", error);
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
        .select("invoice_no")
        .like("invoice_no", "%")
        .order("invoice_no", { ascending: false })
        .limit(1)
        .single();

      let nextNumber = 1;

      if (lastInvoice) {
        // Extract the numeric part - handle both INV-000001 and 000001 formats
        const numericPart = lastInvoice.invoice_no.replace("INV-", "");
        const currentNumber = parseInt(numericPart);
        nextNumber = currentNumber + 1;
      }

      // Format as 000001 (6 digits with leading zeros)
      return nextNumber.toString().padStart(6, "0");
    } catch (error) {
      console.error("Error generating invoice number:", error);
      throw error;
    }
  }

  static async createInvoice(
    customerId: string,
  ): Promise<{ id: string; invoice_no: string }> {
    try {
      // Get document type ID for 'IN'
      const documentType = await this.getDocumentTypeIdByRef("ORD");

      // Generate invoice reference number
      const invoiceNo = await this.generateInvoiceRefNo();

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          customer_id: customerId,
          document_type_id: documentType.id,
          invoice_no: invoiceNo,
          status: 'Pending',
        })
        .select("id, invoice_no")
        .single();

      if (error) {
        throw error;
      }

      // Insert into invoice_logs table with default 'Pending' status
      const { error: logError } = await supabase
        .from("invoice_logs")
        .insert({
          invoice_id: data.id,
          status: 'Pending',
        });

      if (logError) {
        throw logError;
      }

      return data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  static async getInvoiceById(invoiceId: string): Promise<{
    id: string;
    invoice_no: string;
    document_reference_number: string | null;
    customer_id: string;
    status: string;
    product_id: string;
    color_id: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          id,
          invoice_no,
          document_reference_number,
          customer_id,
          status,
          product_id,
          color_id
        `
        )
        .eq("id", invoiceId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Invoice not found");
      }

      return data;
    } catch (error) {
      console.error("Error fetching invoice by ID:", error);
      throw error;
    }
  }

  static async updateInvoiceWithProductDetails(
    invoiceId: string,
    productId: string,
    colorId: string | null,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          product_id: productId,
          color_id: colorId,
        })
        .eq("id", invoiceId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating invoice with product details:", error);
      throw error;
    }
  }

  static async createProductSizes(
    invoiceId: string,
    sizeSelection: OrderData["sizeSelection"],
  ) {
    try {
      const sizeInserts = sizeSelection
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          invoice_id: invoiceId,
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
    invoiceId: string,
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
            invoice_id: invoiceId,
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
  ): Promise<OrderResult & { invoiceNo: string }> {
    try {
      // Create customer
      const customerData = await this.createCustomer(
        orderData.contactInformation,
      );

      // Create invoice
      const invoiceData = await this.createInvoice(customerData.id);

      // Always get product ID for the product type
      // If brandId exists, use it to find the specific product
      // If no brandId (is_onlyType), find any product for this product type
      let productId: string;

      if (orderData.brandId) {
        const productData = await this.getBrandTypeId(
          orderData.brandId,
          orderData.productTypeId,
        );
        productId = productData.id;
      } else {
        // For is_onlyType products, find any product for this product type
        const { data: defaultProduct } = await supabase
          .from("products")
          .select("id")
          .eq("product_type_id", orderData.productTypeId)
          .limit(1)
          .single();

        if (!defaultProduct) {
          throw new Error("No product found for this product type");
        }

        productId = defaultProduct.id;
      }

      // Update invoice with product details
      await this.updateInvoiceWithProductDetails(
        invoiceData.id,
        productId,
        orderData.colorId,
      );

      // Create product sizes
      await this.createProductSizes(
        invoiceData.id,
        orderData.sizeSelection,
      );

      // Upload product images
      await this.uploadProductImages(invoiceData.id, orderData.assets);

      return {
        customerData,
        productOrderData: { 
          id: invoiceData.id, 
          customer_id: customerData.id,
          product_id: productId,
          color_id: orderData.colorId,
        },
        invoiceNo: invoiceData.invoice_no,
      };
    } catch (error) {
      console.error("Error processing order:", error);
      throw error;
    }
  }

  static async getInvoicesCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error fetching invoices count:", error);
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

      // Get all invoices (now replacing product_orders)
      const { data: allInvoices, error: invoicesError } = await supabase
        .from("invoices")
        .select(
          `
          id,
          created_at,
          customer_id,
          invoice_no,
          document_reference_number,
          status,
          customers (
            id,
            name,
            email,
            contact_number
          ),
          document_types (id, ref_c2, description)
        `,
        )
        .order("created_at", { ascending: false });

      if (invoicesError) {
        console.error("Error fetching invoices:", invoicesError);
        return {
          activities: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        };
      }

      // Transform invoices to include customer information for buildActivityFromInvoices
      const transformedInvoices = allInvoices?.map((invoice) => {
        const customer = invoice.customers;
        return {
          ...invoice,
          customers: customer || null,
        };
      }) || [];

      const allActivities = this.buildActivityFromInvoices(
        transformedInvoices,
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
      // First, get basic invoices with customer information
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select(
          `
          id,
          created_at,
          customer_id,
          product_id,
          color_id,
          invoice_no,
          document_types!inner (
            id,
            ref_c2
          ),
          status,
          customers (
            id,
            name,
            email,
            contact_number
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (invoicesError) {
        console.error("Error fetching invoices:", invoicesError);
        return [];
      }

      if (!invoices || invoices.length === 0) {
        return [];
      }

      // Get product information
      const productIds = invoices
        .map((invoice) => invoice.product_id)
        .filter(Boolean);

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          `
          id,
          brand_id,
          product_type_id,
          brands (id, name),
          product_type (id, name, is_onlyType, image_products (filepath, is_hasBack))
        `,
        )
        .in("id", productIds);

      if (productsError) {
        console.error("Error fetching products:", productsError);
      }

      // Get color information
      const colorIds = invoices.map((invoice) => invoice.color_id).filter(Boolean);
      const { data: colors, error: colorsError } = await supabase
        .from("colors")
        .select("id, value")
        .in("id", colorIds);

      if (colorsError) {
        console.error("Error fetching colors:", colorsError);
      }

      // Get product sizes for each invoice
      const { data: productSizes, error: sizesError } = await supabase
        .from("product_sizes")
        .select(
          `
          id,
          invoice_id,
          size_id,
          quantity,
          sizes (id, value)
        `,
        )
        .in(
          "invoice_id",
          invoices.map((invoice) => invoice.id),
        );

      if (sizesError) {
        console.error("Error fetching product sizes:", sizesError);
      }

      // Get product images for each invoice
      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("id, invoice_id, url, place")
        .in(
          "invoice_id",
          invoices.map((invoice) => invoice.id),
        );

      if (imagesError) {
        console.error("Error fetching product images:", imagesError);
      }

      // Combine all data
      const combinedOrders = invoices.map((invoice) => {
        const customer = invoice.customers;
        const product = products?.find((p) => p.id === invoice.product_id);
        const color = colors?.find((c) => c.id === invoice.color_id);
        const sizes = productSizes?.filter((ps) => ps.invoice_id === invoice.id);
        const images = productImages?.filter(
          (pi) => pi.invoice_id === invoice.id,
        );

        // Ensure sizes is properly formatted
        const formattedSizes = sizes?.map((size) => ({
          ...size,
          sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes,
        }));

        const transformedProduct = product
          ? [
              {
                id: product.id,
                brands: Array.isArray(product.brands)
                  ? product.brands[0]
                  : product.brands || undefined,
                product_type: Array.isArray(product.product_type)
                  ? product.product_type[0]
                  : product.product_type || undefined,
              },
            ]
          : [];

        return {
          id: invoice.id,
          created_at: invoice.created_at,
          customers: customer || null,
          brand_type: transformedProduct,
          colors: color ? [color] : [],
          product_sizes: formattedSizes || [],
          product_images: images || [],
          invoice_no: invoice.invoice_no,
          document_types: invoice.document_types,
          status: invoice.status,
          product_id: invoice.product_id,
          color_id: invoice.color_id,
        };
      });

      return combinedOrders;
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      return [];
    }
  }

  private static buildActivityFromInvoices(
    recentInvoices: any[],
    recentCustomers: CustomerActivity[],
  ): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // Add invoice activities
    if (recentInvoices) {
      recentInvoices.forEach((invoice) => {
        const customer = Array.isArray(invoice.customers)
          ? invoice.customers[0]
          : invoice.customers;
        activities.push({
          id: `invoice-${invoice.id}`,
          type: "order" as const,
          title: "New order received",
          description: `Reference No. ${invoice.document_types?.ref_c2} - ${invoice.invoice_no} - ${customer?.name || "Unknown Customer"}`,
          timestamp: invoice.created_at,
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

      // Fetch all invoices for the customer
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select(
          `
          id,
          created_at,
          product_id,
          color_id,
          invoice_no,
          document_reference_number,
          status
        `,
        )
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (invoicesError) {
        console.error("Error fetching invoices:", invoicesError);
        return { customer, orders: [] };
      }

      if (!invoices || invoices.length === 0) {
        return { customer, orders: [] };
      }

      // Get all product IDs from invoices
      const productIds = invoices
        .map((invoice) => invoice.product_id)
        .filter(Boolean);

      // Fetch product details for all invoices
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          `
          id,
          brand_id,
          product_type_id,
          brands (id, name),
          product_type (id, name, is_onlyType, image_products (filepath, is_hasBack))
        `,
        )
        .in("id", productIds);

      if (productsError) {
        console.error("Error fetching products:", productsError);
      }

      // Get all color IDs from invoices
      const colorIds = invoices.map((invoice) => invoice.color_id).filter(Boolean);

      // Fetch color details for all invoices
      const { data: colors, error: colorsError } = await supabase
        .from("colors")
        .select("id, value")
        .in("id", colorIds);

      if (colorsError) {
        console.error("Error fetching colors:", colorsError);
      }

      // Fetch product sizes for all invoices
      const { data: productSizes, error: sizesError } = await supabase
        .from("product_sizes")
        .select(
          `
          id,
          invoice_id,
          size_id,
          quantity,
          sizes (id, value)
        `,
        )
        .in(
          "invoice_id",
          invoices.map((invoice) => invoice.id),
        );

      if (sizesError) {
        console.error("Error fetching product sizes:", sizesError);
      }

      // Fetch product images for all invoices
      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("id, invoice_id, url, place")
        .in(
          "invoice_id",
          invoices.map((invoice) => invoice.id),
        );

      if (imagesError) {
        console.error("Error fetching product images:", imagesError);
      }

      // Combine all data for each invoice
      const combinedOrders = invoices.map((invoice) => {
        const product = products?.find((p) => p.id === invoice.product_id);
        const color = colors?.find((c) => c.id === invoice.color_id);
        const sizes = productSizes?.filter((ps) => ps.invoice_id === invoice.id);
        const images = productImages?.filter(
          (pi) => pi.invoice_id === invoice.id,
        );

        // Ensure sizes is properly formatted
        const formattedSizes = sizes?.map((size) => ({
          ...size,
          sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes,
        }));

        const transformedProduct = product
          ? [
              {
                id: product.id,
                brands: Array.isArray(product.brands)
                  ? product.brands[0]
                  : product.brands || undefined,
                product_type: Array.isArray(product.product_type)
                  ? product.product_type[0]
                  : product.product_type || undefined,
              },
            ]
          : [];

        return {
          id: invoice.id,
          created_at: invoice.created_at,
          brand_type: transformedProduct,
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
      // First, get the specific invoice with customer information
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select(
          `
          id,
          created_at,
          customer_id,
          product_id,
          color_id,
          invoice_no,
          document_reference_number,
          status,
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
          )
        `,
        )
        .eq("id", orderId)
        .single();

      if (invoiceError) {
        console.error("Error fetching invoice:", invoiceError);
        return {} as OrderWithCustomer;
      }

      if (!invoice) {
        return {} as OrderWithCustomer;
      }

      // Get product information
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          `
          id,
          brand_id,
          product_type_id,
          brands (id, name),
          product_type (id, name, is_onlyType, image_products (filepath, is_hasBack))
        `,
        )
        .eq("id", invoice.product_id);

      if (productsError) {
        console.error("Error fetching products:", productsError);
      }

      // Get color information
      const { data: colors, error: colorsError } = await supabase
        .from("colors")
        .select("id, value")
        .eq("id", invoice.color_id);

      if (colorsError) {
        console.error("Error fetching colors:", colorsError);
      }

      // Get product sizes for the invoice
      const { data: productSizes, error: sizesError } = await supabase
        .from("product_sizes")
        .select(
          `
          id,
          invoice_id,
          size_id,
          quantity,
          sizes (id, value)
        `,
        )
        .eq("invoice_id", invoice.id);

      if (sizesError) {
        console.error("Error fetching product sizes:", sizesError);
      }

      // Get product images for the invoice
      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("id, invoice_id, url, place")
        .eq("invoice_id", invoice.id);

      if (imagesError) {
        console.error("Error fetching product images:", imagesError);
      }

      // Combine all data
      const customer = invoice.customers;
      const product = products?.[0];
      const color = colors?.[0];

      // Ensure sizes is properly formatted
      const formattedSizes = productSizes?.map((size) => ({
        ...size,
        sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes,
      }));

      const transformedProduct = product
        ? [
            {
              id: product.id,
              brands: Array.isArray(product.brands)
                ? product.brands[0]
                : product.brands || undefined,
              product_type: Array.isArray(product.product_type)
                ? product.product_type[0]
                : product.product_type || undefined,
            },
          ]
        : [];

      return {
        id: invoice.id,
        created_at: invoice.created_at,
        customers: Array.isArray(customer) ? customer[0] : customer,
        brand_type: transformedProduct,
        colors: color ? [color] : [],
        product_sizes: formattedSizes || [],
        product_images: productImages || [],
        invoice_no: invoice.invoice_no,
        document_reference_number: invoice.document_reference_number,
        status: invoice.status,
        product_id: invoice.product_id,
        color_id: invoice.color_id,
      };
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      return {} as OrderWithCustomer;
    }
  }
}
