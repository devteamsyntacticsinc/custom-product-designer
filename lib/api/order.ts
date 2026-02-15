import { supabase } from "@/lib/supabase"
import { OrderData, OrderResult } from "@/types/product"
import { OrderWithCustomer, CustomerActivity, ActivityItem } from "@/types/order"

export class OrderService {
  static async createCustomer(contactInformation: OrderData['contactInformation']): Promise<OrderResult['customerData']> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: contactInformation.fullName,
          email: contactInformation.email,
          contact_number: contactInformation.contactNumber,
          address: contactInformation.address,
        })
        .select()
        .single();

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  static async getBrandTypeId(brandId: string, typeId: string): Promise<{ id: string }> {
    try {
      const { data, error } = await supabase
        .from('brand_type')
        .select('id')
        .eq('brand_id', brandId)
        .eq('type_id', typeId)
        .single();

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching brand type ID:', error)
      throw error
    }
  }

  static async createProductOrder(customerId: string, brandTypeId: string, colorId: string): Promise<OrderResult['productOrderData']> {
    try {
      const { data, error } = await supabase
        .from('product_orders')
        .insert({
          customer_id: customerId,
          brandT_id: brandTypeId,
          color_id: colorId,
        })
        .select()
        .single();

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating product order:', error)
      throw error
    }
  }

  static async createProductSizes(productOrderId: string, sizeSelection: OrderData['sizeSelection']) {
    try {
      const sizeInserts = sizeSelection
        .filter(item => item.quantity > 0)
        .map(item => ({
          productO_id: productOrderId,
          size_id: item.size,
          quantity: item.quantity,
        }));

      if (sizeInserts.length > 0) {
        const { error } = await supabase
          .from('product_sizes')
          .insert(sizeInserts);

        if (error) {
          console.error('Error creating product sizes:', error)
          throw error
        }

        return true
      }
      
      return true
    } catch (error) {
      console.error('Error creating product sizes:', error)
      throw error
    }
  }

  static async uploadProductImages(productOrderId: string, assets: OrderData['assets']) {
    try {
      const placementMap: Record<string, string> = {
        "front-top-left": "Front - Top Left",
        "front-center": "Front - Center", 
        "back-top": "Back - Top",
        "back-bottom": "Back - Bottom"
      };

      const imageInserts = [];
      for (const [key, file] of Object.entries(assets)) {
        if (file && file instanceof File) {
          // Upload to Supabase Storage
          const fileName = `${Date.now()}-${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('product-images')
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
          .from('product_images')
          .insert(imageInserts);

        if (error) {
          console.error('Error inserting product images:', error);
          throw error
        }
      }

      return true
    } catch (error) {
      console.error('Error uploading product images:', error)
      throw error
    }
  }

  static async processOrder(orderData: OrderData): Promise<OrderResult> {
    try {
      // Create customer
      const customerData = await this.createCustomer(orderData.contactInformation);

      // Get brand type ID using the ID fields
      const brandTypeData = await this.getBrandTypeId(orderData.brandId, orderData.productTypeId);

      // Create product order using the color ID
      const productOrderData = await this.createProductOrder(
        customerData.id,
        brandTypeData.id,
        orderData.colorId
      );

      // Create product sizes
      await this.createProductSizes(productOrderData.id, orderData.sizeSelection);

      // Upload product images
      await this.uploadProductImages(productOrderData.id, orderData.assets);

      return {
        customerData,
        productOrderData
      };
    } catch (error) {
      console.error('Error processing order:', error)
      throw error
    }
  }

  static async getProductOrdersCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('product_orders')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching product orders count:', error)
      return 0
    }
  }

  static async getCustomersCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching customers count:', error)
      return 0
    }
  }

  static async getRecentActivity(): Promise<ActivityItem[]> {
    try {
      // Get recent orders with proper customer join
      const { data: recentOrders, error: ordersError } = await supabase
        .from('product_orders')
        .select(`
          id,
          created_at,
          customers (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      if (ordersError) {
        const { data: ordersData, error: altError } = await supabase
          .from('product_orders')
          .select('id, created_at, customer_id')
          .order('created_at', { ascending: false })
          .limit(3)
        
        if (altError) {
          console.error('Alternative orders query error:', altError)
          throw altError
        }
        
        // Fetch customer data separately
        const customerIds = ordersData?.map(order => order.customer_id).filter(Boolean) || []
        const { data: customersData, error: customersFetchError } = await supabase
          .from('customers')
          .select('id, name, email')
          .in('id', customerIds)
        
        if (customersFetchError) {
          console.error('Customers fetch error:', customersFetchError)
          throw customersFetchError
        }
        
        // Combine order and customer data
        const combinedOrders = ordersData?.map(order => ({
          ...order,
          customers: customersData?.filter(customer => customer.id === order.customer_id) || []
        })) || []
        
        return this.buildActivityFromOrders(combinedOrders, [])
      }

      // Get recent customers
      const { data: recentCustomers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(2)

      if (customersError) {
        console.error('Customers query error:', customersError)
        throw customersError
      }
      
      return this.buildActivityFromOrders(recentOrders, recentCustomers)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  private static buildActivityFromOrders(recentOrders: OrderWithCustomer[], recentCustomers: CustomerActivity[]): ActivityItem[] {
    const activities: ActivityItem[] = []

    // Add order activities
    if (recentOrders) {
      recentOrders.forEach((order) => {
        const customer = Array.isArray(order.customers) 
          ? order.customers[0] 
          : order.customers
        activities.push({
          id: `order-${order.id}`,
          type: 'order' as const,
          title: 'New order received',
          description: `Order #${order.id.toString().slice(-6)} - ${customer?.name || 'Unknown Customer'}`,
          timestamp: order.created_at
        })
      })
    }

    // Add customer activities
    if (recentCustomers) {
      recentCustomers.forEach((customer) => {
        activities.push({
          id: `user-${customer.id}`,
          type: 'user' as const,
          title: 'New user registered',
          description: customer.email,
          timestamp: customer.created_at
        })
      })
    }

    // Sort by timestamp and return latest 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }
}