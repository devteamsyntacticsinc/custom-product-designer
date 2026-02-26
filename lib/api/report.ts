import { supabase } from "@/lib/supabase";

export class ReportService {
    static async getTopCustomers(startDate?: string, endDate?: string, productType?: string) {
        try {
            let query = supabase
                .from('product_orders')
                .select(`
                    id,
                    created_at,
                    brand_type (
                        product_type (
                            name
                        )
                    ),
                    customers (
                        id,
                        name,
                        email
                    )
                `);

            if (startDate) {
                query = query.gte('created_at', startDate);
            }
            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            const { data, error } = await query;

            if (error) throw error;

            const stats: Record<string, { name: string; email: string; count: number }> = {};

            data?.forEach(order => {
                const customer = order.customers as any;
                const custResult = Array.isArray(customer) ? customer[0] : customer;

                // Filter by product type if specified
                if (productType) {
                    const brandType = order.brand_type as any;
                    const pType = brandType?.product_type;
                    const typeName = Array.isArray(pType) ? pType[0]?.name : pType?.name;
                    if (typeName !== productType) return;
                }

                if (custResult && custResult.id) {
                    if (!stats[custResult.id]) {
                        stats[custResult.id] = {
                            name: custResult.name || 'Unknown',
                            email: custResult.email || 'No Email',
                            count: 0
                        };
                    }
                    stats[custResult.id].count++;
                }
            });

            return Object.entries(stats)
                .map(([id, info]) => ({
                    id,
                    ...info
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
        } catch (error) {
            console.error("Error fetching top customers:", error);
            return [];
        }
    }

    static async getOrdersByDay(startDate?: string, endDate?: string) {
        try {
            let query = supabase
                .from('product_orders')
                .select('created_at');

            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data, error } = await query;
            if (error) throw error;

            const stats: Record<string, number> = {};
            data?.forEach(order => {
                const date = new Date(order.created_at).toISOString().split('T')[0];
                stats[date] = (stats[date] || 0) + 1;
            });

            return Object.entries(stats)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date));
        } catch (error) {
            console.error("Error fetching orders by day:", error);
            return [];
        }
    }

    static async getOrdersByProductTypeTimeSeries(startDate?: string, endDate?: string) {
        try {
            let query = supabase
                .from('product_orders')
                .select(`
                    created_at,
                    brand_type (
                        product_type (
                            name
                        )
                    )
                `);

            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data, error } = await query;
            if (error) throw error;

            const timeSeries: Record<string, Record<string, number>> = {};
            const productTypes = new Set<string>();

            data?.forEach(order => {
                const date = new Date(order.created_at).toISOString().split('T')[0];
                const brandType = order.brand_type as any;
                const productType = brandType?.product_type;
                const typeName = Array.isArray(productType) ? productType[0]?.name : productType?.name;

                if (typeName) {
                    productTypes.add(typeName);
                    if (!timeSeries[date]) timeSeries[date] = {};
                    timeSeries[date][typeName] = (timeSeries[date][typeName] || 0) + 1;
                }
            });

            // Fill in missing dates and ensure all product types are present in each entry
            const sortedDates = Object.keys(timeSeries).sort();
            const result = sortedDates.map(date => {
                const entry: any = { date };
                productTypes.forEach(type => {
                    entry[type] = timeSeries[date][type] || 0;
                });
                return entry;
            });

            return {
                data: result,
                types: Array.from(productTypes)
            };
        } catch (error) {
            console.error("Error fetching product type time series:", error);
            return { data: [], types: [] };
        }
    }
}
