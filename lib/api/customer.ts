import { supabase } from "@/lib/supabase";
import { CustomerWithOrders, FilteredOrder } from "@/types/customer";

type CustomerOrder = CustomerWithOrders["orders"][0];

export class CustomerService {
  static async getCustomers(filters?: {
    product_type?: string;
    brand?: string;
    size?: string;
    color?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<CustomerWithOrders[]> {
    try {
      let query = supabase
        .from("customers")
        .select(
          `
                    id, 
                    name, 
                    email, 
                    contact_number
                `,
        )
        .order("name");

      let filterData: FilteredOrder[];

      // If filters are applied, we need to join with invoices and filter
      if (
        filters &&
        (filters.product_type ||
          filters.brand ||
          filters.size ||
          filters.color ||
          filters.date_from ||
          filters.date_to)
      ) {
        // Build a single query with all necessary joins
        const brandJoin = filters.brand
          ? "brands!inner(id, name)"
          : "brands(id, name)";
        let selectQuery = `
          customer_id,
          products!inner(
            id,
            ${brandJoin},
            product_type!inner(id, name)
          )
        `;

        // Add sizes join if size filter is present
        if (filters.size) {
          selectQuery += `,
            product_sizes!inner(
              invoice_id,
              sizes!inner(id, value)
            )
          `;
        }

        // Add colors join if color filter is present
        if (filters.color) {
          selectQuery += `,
            colors!inner(id, value)
          `;
        }

        // Add created_at to select for date filtering
        if (filters.date_from || filters.date_to) {
          selectQuery += `,
            created_at
          `;
        }

        let orderQuery = supabase.from("invoices").select(selectQuery);

        // Apply filter conditions
        if (filters.product_type) {
          orderQuery = orderQuery.eq(
            "product_type.name",
            filters.product_type,
          );
        }
        if (filters.brand) {
          orderQuery = orderQuery.eq("products.brands.name", filters.brand);
        }
        if (filters.size) {
          orderQuery = orderQuery.eq("product_sizes.sizes.value", filters.size);
        }
        if (filters.color) {
          orderQuery = orderQuery.eq("colors.value", filters.color);
        }
        if (filters.date_from) {
          orderQuery = orderQuery.gte("created_at", filters.date_from);
        }
        if (filters.date_to) {
          orderQuery = orderQuery.lte("created_at", filters.date_to);
        }

        const { data: filteredOrders, error: filterError } = await orderQuery;

        if (filterError) {
          console.error("Error filtering customers:", filterError);
          return [];
        }
        if (!filteredOrders || filteredOrders.length === 0) {
          return [];
        }
        filterData = filteredOrders as unknown as FilteredOrder[];
        // Get unique customer IDs from filtered orders
        const customerIds = [
          ...new Set(
            (filteredOrders as any[])?.map((o) => o.customer_id) || [],
          ),
        ];

        if (customerIds.length === 0) {
          return [];
        }

        // Fetch only customers who have matching orders
        query = query.in("id", customerIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching customers:", error);
        return [];
      }

      return (data || []).map((customer) => ({
        ...customer,
        orders: [],
        hasBrands: filterData?.some(
          (order) => order.products?.brands !== null,
        ),
      })) as CustomerWithOrders[];
    } catch (error) {
      console.error("Error in getCustomers:", error);
      return [];
    }
  }

  static async getCustomerOrders(
    customerId: string,
  ): Promise<CustomerOrder[]> {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from("invoices")
        .select(
          `
                    id,
                    created_at,
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
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return [];
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      const orderIds = orders.map((o) => o.id);
      const brandTypeIds = orders.map((o) => o.product_id).filter(Boolean);
      const colorIds = orders.map((o) => o.color_id).filter(Boolean);

      const [
        { data: brandTypes },
        { data: colors },
        { data: productSizes },
        { data: productImages },
      ] = await Promise.all([
        supabase
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
          .in("id", brandTypeIds),
        supabase.from("colors").select("id, value").in("id", colorIds),
        supabase
          .from("product_sizes")
          .select("id, invoice_id, size_id, quantity, sizes(id, value)")
          .in("invoice_id", orderIds),
        supabase
          .from("product_images")
          .select("id, invoice_id, url, place")
          .in("invoice_id", orderIds),
      ]);

      return orders.map((order) => {
        const brandType = brandTypes?.find((bt) => bt?.id === order.product_id);
        const color = colors?.find((c) => c?.id === order.color_id);
        const sizes = productSizes?.filter((ps) => ps?.invoice_id === order.id);
        const images = productImages?.filter(
          (pi) => pi?.invoice_id === order.id,
        );

        return {
          id: order.id,
          created_at: order.created_at,
          products: brandType
            ? [
                {
                  id: brandType.id,
                  brands: Array.isArray(brandType.brands)
                    ? brandType.brands[0]
                    : brandType.brands ?? undefined,
                  product_type: Array.isArray(brandType.product_type)
                    ? brandType.product_type[0]
                    : brandType.product_type ?? undefined,
                },
              ]
            : undefined,
          colors: color ? [color] : undefined,
          product_sizes: sizes,
          product_images: images,
        } as CustomerOrder;
      });
    } catch (error) {
      console.error("Error in getCustomerOrders:", error);
      return [];
    }
  }
}
