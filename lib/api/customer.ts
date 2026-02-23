import { supabase } from "@/lib/supabase"
import { CustomerWithOrders } from "@/types/customer"

export class CustomerService {
    static async getCustomers(): Promise<CustomerWithOrders[]> {
        try {
            const { data, error } = await supabase
                .from("customers")
                .select(`
                    id, 
                    name, 
                    email, 
                    contact_number,
                    orders:product_orders(count)
                `)
                .order("name");

            if (error) {
                console.error("Error fetching customers:", error);
                return [];
            }

            return (data || []).map(customer => ({
                ...customer,
                orders: Array(customer.orders?.[0]?.count || 0).fill({})
            })) as CustomerWithOrders[];
        } catch (error) {
            console.error("Error in getCustomers:", error);
            return [];
        }
    }

    static async getCustomerOrders(customerId: string): Promise<CustomerWithOrders['orders']> {
        try {

            const { data: orders, error: ordersError } = await supabase
                .from("product_orders")
                .select(`
                    id,
                    created_at,
                    brandT_id,
                    color_id
                `)
                .eq("customer_id", customerId)
                .order("created_at", { ascending: false });

            if (ordersError) {
                console.error("Error fetching orders:", ordersError);
                return [];
            }

            if (!orders || orders.length === 0) {
                return [];
            }

            const orderIds = orders.map(o => o.id);
            const brandTypeIds = orders.map(o => o.brandT_id).filter(Boolean);
            const colorIds = orders.map(o => o.color_id).filter(Boolean);

            const [
                { data: brandTypes },
                { data: colors },
                { data: productSizes },
                { data: productImages }
            ] = await Promise.all([
                supabase.from('brand_type').select('id, brands(id, name), product_type(id, name)').in('id', brandTypeIds),
                supabase.from('colors').select('id, value').in('id', colorIds),
                supabase.from('product_sizes').select('id, productO_id, size_id, quantity, sizes(id, value)').in('productO_id', orderIds),
                supabase.from('product_images').select('id, productO_id, url, place').in('productO_id', orderIds)
            ]);

            return orders.map(order => {
                const brandType = brandTypes?.find(bt => bt.id === order.brandT_id);
                const color = colors?.find(c => c.id === order.color_id);
                const sizes = productSizes?.filter(ps => ps.productO_id === order.id);
                const images = productImages?.filter(pi => pi.productO_id === order.id);

                const transformedBrandType = brandType ? [{
                    id: brandType.id,
                    brands: Array.isArray(brandType.brands) ? brandType.brands[0] : (brandType.brands || undefined),
                    product_type: Array.isArray(brandType.product_type) ? brandType.product_type[0] : (brandType.product_type || undefined)
                }] : [];

                return {
                    id: order.id,
                    created_at: order.created_at,
                    brand_type: transformedBrandType,
                    colors: color ? [color] : [],
                    product_sizes: (sizes || []).map(size => ({
                        ...size,
                        sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes
                    })),
                    product_images: images || []
                };
            }) as CustomerWithOrders['orders'];
        } catch (error) {
            console.error("Error in getCustomerOrders:", error);
            return [];
        }
    }
}