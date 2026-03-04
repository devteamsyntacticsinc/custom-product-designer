import { supabase } from "@/lib/supabase";
import { TopCustomers } from "@/types/report";

export class ReportService {
  static async getTopCustomers(
    startDate?: string,
    endDate?: string,
    productType?: number,
  ) {
    try {
      let query = supabase.from("invoices").select(
        `
                    id,
                    created_at,
                    product_id,
                    customer_id,
                    customers (
                        id,
                        name,
                        email
                    ),
                    products!inner (
                        id,
                        product_type_id
                    )
                `,
      );

      if (startDate) {
        query = query.gte("created_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        query = query.lte("created_at", new Date(endDate).toISOString());
      }
      if (productType && productType !== 0) {
        query = query.eq("products.product_type_id", productType);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats: Record<
        string,
        { name: string; email: string; count: number }
      > = {};

      data?.forEach((order: any) => {
        const customer = order.customers;
        const custResult = Array.isArray(customer) ? customer[0] : customer;

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
      let query = supabase.from("invoices").select(`
                    created_at,
                    products (
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

      data?.forEach((order: any) => {
        const date = new Date(order.created_at).toISOString().split("T")[0];

        const product = order.products;
        const prodResult = Array.isArray(product) ? product[0] : product;
        const productType = prodResult?.product_type;
        const typeResult = Array.isArray(productType) ? productType[0] : productType;
        const typeName = typeResult?.name || "Product";

        productTypes.add(typeName);
        if (!timeSeries[date]) timeSeries[date] = {};
        timeSeries[date][typeName] = (timeSeries[date][typeName] || 0) + 1;
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
      let query = supabase.from("invoices").select(`
                created_at,
                products (
                    brands (
                        name
                    ),
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
      const brandsSet = new Set<string>();

      data?.forEach((order: any) => {
        const date = new Date(order.created_at).toISOString().split("T")[0];

        const product = order.products;
        const prodResult = Array.isArray(product) ? product[0] : product;

        const brand = prodResult?.brands;
        const brandResult = Array.isArray(brand) ? brand[0] : brand;

        // Skip if there is no brand name
        if (!brandResult?.name) return;

        const brandName = brandResult.name;

        brandsSet.add(brandName);

        if (!timeSeries[date]) {
          timeSeries[date] = {};
        }
        timeSeries[date][brandName] = (timeSeries[date][brandName] || 0) + 1;
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
