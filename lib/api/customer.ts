import { supabase } from "@/lib/supabase"
import { CustomerWithOrders } from "@/types/customer"

export class CustomerService {
    static async getCustomersWithOrders() {
        const { data, error } = await supabase
            .from("customers")
            .select(`
                id,
                name,
                email,
                contact_number,
                orders:product_orders(
                    id,
                    created_at,
                    brand_type:brand_type(
                        id,
                        brands:brands(
                            id,
                            name
                        ),
                        product_type:product_type(
                            id,
                            name
                        )
                    ),
                    colors:colors(
                        id,
                        value
                    ),
                    product_sizes:product_sizes(
                        id,
                        size_id,
                        quantity,
                        sizes:sizes(
                            id,
                            value
                        )
                    ),
                    product_images:product_images(
                        id,
                        url,
                        place
                    )
                )
            `)
            .order("created_at", { foreignTable: "product_orders", ascending: false })

        if (error) throw error

        // Transform the data to ensure it matches the CustomerWithOrders interface
        const transformedData = (data as any[] | null)?.map(customer => ({
            ...customer,
            orders: customer.orders?.map((order: any) => {
                // brand_type join from many-to-one returns a single object or null
                const bt = order.brand_type;
                const brandTypeArray = bt ? [{
                    id: bt.id,
                    brands: Array.isArray(bt.brands) ? bt.brands[0] : bt.brands,
                    product_type: Array.isArray(bt.product_type) ? bt.product_type[0] : bt.product_type
                }] : [];

                return {
                    ...order,
                    brand_type: brandTypeArray,
                    // colors join should be an array already if it's a many-to-many or correctly mapped
                    colors: Array.isArray(order.colors) ? order.colors : (order.colors ? [order.colors] : []),
                    product_sizes: order.product_sizes?.map((ps: any) => ({
                        ...ps,
                        sizes: Array.isArray(ps.sizes) ? ps.sizes[0] : ps.sizes
                    }))
                };
            })
        }));

        return transformedData as CustomerWithOrders[] | null
    }
}

// Export the function separately as well for backward compatibility (e.g., used in routes)
export const getCustomersWithOrders = CustomerService.getCustomersWithOrders;