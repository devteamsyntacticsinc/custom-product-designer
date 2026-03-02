import { supabase } from "@/lib/supabase";
import { TopCustomers } from "@/types/report";

export class ReportService {
  static async getTopCustomers(
    startDate?: string,
    endDate?: string,
    productType?: number,
  ) {
    try {
      let query = supabase.from("product_orders").select(
        `
                    id,
                    created_at,
                    brand_type (
                        product_type (
                            id,
                            name
                        )
                    ),
                    invoices (
                        id,
                        customer_id,
                        customers (
                            id,
                            name,
                            email
                        )
                    )
                `,
      );

      if (startDate) {
        query = query.gte("created_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        query = query.lte("created_at", new Date(endDate).toISOString());
      }

      const { data, error } = await query.overrideTypes<TopCustomers[]>();

      if (error) throw error;

      const stats: Record<
        string,
        { name: string; email: string; count: number }
      > = {};

      data?.forEach((order) => {
        const customer = order.invoices?.customers;
        const custResult = Array.isArray(customer) ? customer[0] : customer;

        // Filter by product type if specified
        if (productType) {
          const brandType = order.brand_type;
          const pType = brandType?.product_type;
          const typeId = Array.isArray(pType) ? pType[0]?.id : pType?.id;

          if (Number(typeId) !== Number(productType)) return;
        }

        if (custResult && custResult.id) {
          if (!stats[custResult.id]) {
            stats[custResult.id] = {
              name: custResult.name || "Unknown",
              email: custResult.email || "No Email",
              count: 0,
            };
          }
          stats[custResult.id].count++;
        }
      });

      return Object.entries(stats)
        .map(([id, info]) => ({
          id,
          ...info,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching top customers:", error);
      return [];
    }
  }

  static async getOrdersByProductTypeTimeSeries(
    startDate?: string,
    endDate?: string,
  ) {
    try {
      let query = supabase.from("product_orders").select(`
                    created_at,
                    brand_type (
                        product_type (
                            name
                        )
                    )
                `);

      if (startDate)
        query = query.gte("created_at", new Date(startDate).toISOString());
      if (endDate)
        query = query.lte("created_at", new Date(endDate).toISOString());

      const { data, error } = await query;
      if (error) throw error;

      const timeSeries: Record<string, Record<string, number>> = {};
      const productTypes = new Set<string>();

      data?.forEach((order) => {
        const date = new Date(order.created_at).toISOString().split("T")[0];
        const brandType = order.brand_type as any;
        const productType = brandType?.product_type;
        const typeName = Array.isArray(productType)
          ? productType[0]?.name
          : productType?.name;

        if (typeName) {
          productTypes.add(typeName);
          if (!timeSeries[date]) timeSeries[date] = {};
          timeSeries[date][typeName] = (timeSeries[date][typeName] || 0) + 1;
        }
      });

      // Fill in missing dates and ensure all product types are present in each entry
      const sortedDates = Object.keys(timeSeries).sort();
      const result = sortedDates.map((date) => {
        const entry: any = { date };
        productTypes.forEach((type) => {
          entry[type] = timeSeries[date][type] || 0;
        });
        return entry;
      });

      return {
        data: result,
        types: Array.from(productTypes),
      };
    } catch (error) {
      console.error("Error fetching product type time series:", error);
      return { data: [], types: [] };
    }
  }

  static async getMostOrderedBrand(startDate?: string, endDate?: string) {
    try {
      let query = supabase.from("product_orders").select(`
                created_at,
                brand_type (
                    brands (
                        name
                    )
                )
            `);

      if (startDate)
        query = query.gte("created_at", new Date(startDate).toISOString());
      if (endDate)
        query = query.lte("created_at", new Date(endDate).toISOString());

      const { data, error } = await query;
      if (error) throw error;

      const timeSeries: Record<string, Record<string, number>> = {};
      const brandsSet = new Set<string>();

      data?.forEach((order: any) => {
        const date = new Date(order.created_at).toISOString().split("T")[0];

        // Ensure brand_type is always an array
        const brandTypeArray = Array.isArray(order.brand_type)
          ? order.brand_type
          : order.brand_type
            ? [order.brand_type]
            : [];

        brandTypeArray.forEach((bt: any) => {
          const brandName = bt?.brands?.name;

          if (!brandName) return;

          brandsSet.add(brandName);

          if (!timeSeries[date]) {
            timeSeries[date] = {};
          }

          timeSeries[date][brandName] = (timeSeries[date][brandName] || 0) + 1;
        });
      });

      // Sort dates
      const sortedDates = Object.keys(timeSeries).sort();

      const result = sortedDates.map((date) => {
        const entry: any = { date };

        brandsSet.forEach((brand) => {
          entry[brand] = timeSeries[date][brand] || 0;
        });

        return entry;
      });

      return {
        data: result,
        types: Array.from(brandsSet),
      };
    } catch (error) {
      console.error("Error fetching most ordered brand:", error);
      return { data: [], types: [] };
    }
  }
}
