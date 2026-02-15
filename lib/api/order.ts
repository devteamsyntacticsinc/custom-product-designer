import { supabase } from "@/lib/supabase"
import { OrderData, OrderResult } from "@/types/product"
import { OrderWithCustomer, CustomerActivity, ActivityItem } from "@/types/order"

export class OrderService {
  static async createCustomer(contactInformation: OrderData['contactInformation']): Promise<OrderResult['customerData']> {
    try {
      // First, check if a customer with this email already exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, name, email, contact_number, address')
        .eq('email', contactInformation.email)
        .single();

      // If customer exists, return the existing customer data
      if (existingCustomer) {
        
        // Optionally update customer information if it has changed
        const needsUpdate = 
          existingCustomer.name !== contactInformation.fullName ||
          existingCustomer.contact_number !== contactInformation.contactNumber ||
          existingCustomer.address !== contactInformation.address;

        if (needsUpdate) {
          const { data: updatedCustomer } = await supabase
            .from('customers')
            .update({
              name: contactInformation.fullName,
              contact_number: contactInformation.contactNumber,
              address: contactInformation.address,
            })
            .eq('id', existingCustomer.id)
            .select()
            .single();

          console.log('Existing customer updated:', updatedCustomer.email);
          return updatedCustomer;
        }
        
        return existingCustomer;
      }

      // If no existing customer, create a new one
      const { data } = await supabase
        .from('customers')
        .insert({
          name: contactInformation.fullName,
          email: contactInformation.email,
          contact_number: contactInformation.contactNumber,
          address: contactInformation.address,
        })
        .select()
        .single();

      console.log('New customer created:', data.email);
      return data
    } catch (error) {
      console.error('Error creating/fetching customer:', error)
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

  static async getAllOrders(): Promise<OrderWithCustomer[]> {
    try {
      // First, get basic orders with all required fields
      const { data: orders, error: ordersError } = await supabase
        .from('product_orders')
        .select(`
          id,
          created_at,
          customer_id,
          brandT_id,
          color_id
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return [];
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      // Get customer information
      const customerIds = orders.map(order => order.customer_id).filter(Boolean);
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, email')
        .in('id', customerIds);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
      }

      // Get brand type information
      const brandTypeIds = orders.map(order => order.brandT_id).filter(Boolean);
      const { data: brandTypes, error: brandTypesError } = await supabase
        .from('brand_type')
        .select(`
          id,
          brand_id,
          type_id,
          brands (id, name),
          product_type (id, name)
        `)
        .in('id', brandTypeIds);

      if (brandTypesError) {
        console.error('Error fetching brand types:', brandTypesError);
      }

      // Get color information
      const colorIds = orders.map(order => order.color_id).filter(Boolean);
      const { data: colors, error: colorsError } = await supabase
        .from('colors')
        .select('id, value')
        .in('id', colorIds);

      if (colorsError) {
        console.error('Error fetching colors:', colorsError);
      }

      // Get product sizes for each order
      const { data: productSizes, error: sizesError } = await supabase
        .from('product_sizes')
        .select(`
          id,
          productO_id,
          size_id,
          quantity,
          sizes (id, value)
        `)
        .in('productO_id', orders.map(order => order.id));

      if (sizesError) {
        console.error('Error fetching product sizes:', sizesError);
      }

      // Get product images for each order
      const { data: productImages, error: imagesError } = await supabase
        .from('product_images')
        .select('id, productO_id, url, place')
        .in('productO_id', orders.map(order => order.id));

      if (imagesError) {
        console.error('Error fetching product images:', imagesError);
      }

      // Combine all data
      const combinedOrders = orders.map(order => {
        const customer = customers?.find(c => c.id === order.customer_id);
        const brandType = brandTypes?.find(bt => bt.id === order.brandT_id);
        const color = colors?.find(c => c.id === order.color_id);
        const sizes = productSizes?.filter(ps => ps.productO_id === order.id);
        const images = productImages?.filter(pi => pi.productO_id === order.id);

        // Ensure sizes is properly formatted
        const formattedSizes = sizes?.map(size => ({
          ...size,
          sizes: Array.isArray(size.sizes) ? size.sizes[0] : size.sizes
        }));

        return {
          ...order,
          customers: customer || null,
          brand_type: brandType ? [{
            id: brandType.id,
            brands: brandType.brands || [],
            product_type: brandType.product_type || []
          }] : [],
          colors: color ? [color] : [],
          product_sizes: formattedSizes || [],
          product_images: images || []
        };
      });

      return combinedOrders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
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