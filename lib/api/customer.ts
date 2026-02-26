import { supabase } from "@/lib/supabase";
import { Customer, CustomerWithOrders, FilteredOrder } from "@/types/customer";

export class CustomerService {
  static async getCustomers(filters?: {
    product_type?: string;
    brand?: string;
    size?: string;
    color?: string;
  }): Promise<CustomerWithOrders[]> {
    try {
      let query = supabase
        .from("customers")
        .select(
          `
                    id, 
                    name, 
                    email, 
                    contact_number,
                    orders:product_orders(count)
                `,
        )
        .order("name");

      let filterData: FilteredOrder[];

      // If filters are applied, we need to join with orders and filter
      if (
        filters &&
        (filters.product_type || filters.brand || filters.size || filters.color)
      ) {
        // Build a single query with all necessary joins
        const brandJoin = filters.brand
          ? "brands!inner(id, name)"
          : "brands(id, name)";
        let selectQuery = `
          customer_id,
          brand_type!inner(
            id,
            ${brandJoin},
            product_type!inner(id, name)
          )
        `;

        // Add sizes join if size filter is present
        if (filters.size) {
          selectQuery += `,
            product_sizes!inner(
              productO_id,
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

        let orderQuery = supabase.from("product_orders").select(selectQuery);

        // Apply filter conditions
        if (filters.product_type) {
          orderQuery = orderQuery.eq(
            "brand_type.product_type.name",
            filters.product_type,
          );
        }
        if (filters.brand) {
          orderQuery = orderQuery.eq("brand_type.brands.name", filters.brand);
        }
        if (filters.size) {
          orderQuery = orderQuery.eq("product_sizes.sizes.value", filters.size);
        }
        if (filters.color) {
          orderQuery = orderQuery.eq("colors.value", filters.color);
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
        orders: Array(customer.orders?.[0]?.count || 0).fill({}),
        hasBrands: filterData?.some(
          (order) => order.brand_type?.brands !== null,
        ),
      })) as CustomerWithOrders[];
    } catch (error) {
      console.error("Error in getCustomers:", error);
      return [];
    }
  }

  static async getCustomerOrders(
    customerId: string,
  ): Promise<CustomerWithOrders["orders"]> {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from("product_orders")
        .select(
          `
                    id,
                    created_at,
                    brandT_id,
                    color_id
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
      const brandTypeIds = orders.map((o) => o.brandT_id).filter(Boolean);
      const colorIds = orders.map((o) => o.color_id).filter(Boolean);

      const [
        { data: brandTypes },
        { data: colors },
        { data: productSizes },
        { data: productImages },
      ] = await Promise.all([
        supabase
          .from("brand_type")
          .select(
            "id, brands(id, name), product_type(id, name, is_onlyType, image_products(filepath, is_hasBack))",
          )
          .in("id", brandTypeIds),
        supabase.from("colors").select("id, value").in("id", colorIds),
        supabase
          .from("product_sizes")
          .select("id, productO_id, size_id, quantity, sizes(id, value)")
          .in("productO_id", orderIds),
        supabase
          .from("product_images")
          .select("id, productO_id, url, place")
          .in("productO_id", orderIds),
      ]);

      return orders.map((order) => {
        const brandType = brandTypes?.find((bt) => bt.id === order.brandT_id);
        const color = colors?.find((c) => c.id === order.color_id);
        const sizes = productSizes?.filter((ps) => ps.productO_id === order.id);
        const images = productImages?.filter(
          (pi) => pi.productO_id === order.id,
        );

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
          product_sizes: (sizes || []).map((size) => ({
            ...size,
            sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes,
          })),
          product_images: images || [],
        };
      }) as CustomerWithOrders["orders"];
    } catch (error) {
      console.error("Error in getCustomerOrders:", error);
      return [];
    }
  }
}
