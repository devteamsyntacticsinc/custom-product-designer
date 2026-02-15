import { supabase } from "@/lib/supabase"
import { Product, Brand, Color, ProductType, Size } from "@/types/product"

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      // Since there's no 'products' table, we'll return product combinations from size_product
      const { data, error } = await supabase
        .from('size_product')
        .select(`
          id,
          size_id,
          brandT_id,
          sizes (
            id,
            value
          ),
          brand_type (
            id,
            brands (
              id,
              name
            ),
            product_type (
              id,
              name
            )
          )
        `)

      if (error) {
        throw error
      }

      // Transform the data to match Product interface
      return (data?.map(item => ({
        id: item.id,
        product_name: `${item.brand_type?.[0]?.brands?.[0]?.name || 'Unknown'} ${item.brand_type?.[0]?.product_type?.[0]?.name || 'Product'} - ${item.sizes?.[0]?.value || 'Size'}`,
        image: null, // No image in this table structure
        brand_id: item.brand_type?.[0]?.brands?.[0]?.id,
        color_id: null, // No color in this table
        product_type_id: item.brand_type?.[0]?.product_type?.[0]?.id,
        brand: item.brand_type?.[0]?.brands?.[0],
        color: null,
        product_type: item.brand_type?.[0]?.product_type?.[0]
      })) as unknown as Product[]) || []
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      // Since there's no 'products' table, we'll get from size_product
      const { data, error } = await supabase
        .from('size_product')
        .select(`
          id,
          size_id,
          brandT_id,
          sizes (
            id,
            value
          ),
          brand_type (
            id,
            brands (
              id,
              name
            ),
            product_type (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      // Transform the data to match Product interface
      if (data) {
        return {
          id: data.id,
          product_name: `${data.brand_type?.[0]?.brands?.[0]?.name || 'Unknown'} ${data.brand_type?.[0]?.product_type?.[0]?.name || 'Product'} - ${data.sizes?.[0]?.value || 'Size'}`,
          image: null,
          brand_id: data.brand_type?.[0]?.brands?.[0]?.id,
          color_id: null,
          product_type_id: data.brand_type?.[0]?.product_type?.[0]?.id,
          brand: data.brand_type?.[0]?.brands?.[0],
          color: null,
          product_type: data.brand_type?.[0]?.product_type?.[0]
        } as unknown as Product
      }

      return null
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  static async getBrands(typeId?: string): Promise<Brand[]> {
    try {
      if (typeId) {
        // Get brands that have the specified type_id in brand_type table
        const { data, error } = await supabase
          .from('brand_type')
          .select(`
            brand_id,
            brands (
              id,
              name
            )
          `)
          .eq('type_id', typeId)

        if (error) {
          throw error
        }

        return (data?.map(item => item.brands).filter(Boolean).flat() as unknown) as Brand[] || []
      } else {
        // Get all brands
        const { data, error } = await supabase
          .from('brands')
          .select('id, name')
          .order('name')

        if (error) {
          throw error
        }

        return data || []
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      throw error
    }
  }

  static async getColors(): Promise<Color[]> {
    try {
      const { data, error } = await supabase
        .from('colors')
        .select('id, value')
        .order('value')

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching colors:', error)
      throw error
    }
  }

  static async getProductTypes(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('product_type')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error fetching product types:', error)
        // Return fallback data if Supabase is down
        return [
          { id: '1', name: 'T-Shirt' },
          { id: '2', name: 'Hoodie' },
          { id: '3', name: 'Mug' }
        ]
      }

      return data || []
    } catch (error) {
      console.error('Error fetching product types:', error)
      // Return fallback data if there's a network error
      return [
        { id: '1', name: 'T-Shirt' },
        { id: '2', name: 'Hoodie' },
        { id: '3', name: 'Mug' }
      ]
    }
  }

  static async getSizes(): Promise<Size[]> {
    try {
      const { data, error } = await supabase
        .from('sizes')
        .select('id, value')
        .order('value')

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching sizes:', error)
      throw error
    }
  }

  static async getSizesByProductType(typeId?: string, brandId?: string): Promise<Size[]> {
    try {
      if (typeId && brandId) {
        // Filter by both type and brand through brand_type relationship
        const { data: brandTypeData, error: brandTypeError } = await supabase
          .from('brand_type')
          .select('id')
          .eq('type_id', typeId)
          .eq('brand_id', brandId)
          .single()

        if (brandTypeError || !brandTypeData) {
          return [] // No matching brand-type combination
        }

        // Get sizes for this specific brand-type combination using brandT_id
        const { data, error } = await supabase
          .from('size_product')
          .select(`
            size_id,
            sizes (
              id,
              value
            )
          `)
          .eq('brandT_id', brandTypeData.id)

        if (error) {
          throw error
        }

        return data?.flatMap(item => item.sizes).filter(Boolean) || []
      } else if (typeId) {
        // Filter by type only - get all brand_type records that have this type
        const { data: brandTypeData, error: brandTypeError } = await supabase
          .from('brand_type')
          .select('id')
          .eq('type_id', typeId)

        if (brandTypeError) {
          throw brandTypeError
        }

        // If no brands have this type, return empty
        if (!brandTypeData || brandTypeData.length === 0) {
          return []
        }

        // Get sizes for all brand_type records that have this type
        const brandTypeIds = brandTypeData.map(item => item.id)
        const { data, error } = await supabase
          .from('size_product')
          .select(`
            size_id,
            sizes (
              id,
              value
            )
          `)
          .in('brandT_id', brandTypeIds)

        if (error) {
          throw error
        }

        return data?.flatMap(item => item.sizes).filter(Boolean) || []
      } else {
        // No filtering - return all sizes
        const { data, error } = await supabase
          .from('size_product')
          .select(`
            size_id,
            sizes (
              id,
              value
            )
          `)

        if (error) {
          throw error
        }

        return data?.flatMap(item => item.sizes).filter(Boolean) || []
      }
    } catch (error) {
      console.error('Error fetching sizes by product type:', error)
      throw error
    }
  }

  static async getProductCombinationsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('size_product')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching product combinations count:', error)
      return 0
    }
  }

  static async getDashboardStats() {
    try {
      // Import OrderService to avoid circular dependency
      const { OrderService } = await import('@/lib/api/order')
      
      // Get all data in parallel for better performance
      const [
        customers,
        productOrders,
        brands,
        colors,
        productTypes,
        productSizes
      ] = await Promise.all([
        // Get customers count
        OrderService.getCustomersCount(),
        // Get orders count  
        OrderService.getProductOrdersCount(),
        // Get brands count
        this.getBrands().then(brands => brands.length),
        // Get colors count
        this.getColors().then(colors => colors.length),
        // Get product types count
        this.getProductTypes().then(types => types.length),
        // Get product combinations count (instead of products)
        this.getProductCombinationsCount()
      ])

      // Get recent activity
      const recentActivity = await OrderService.getRecentActivity()

      return {
        success: true,
        data: {
          stats: {
            totalOrders: productOrders,
            totalUsers: customers,
            activeProducts: productSizes, // Using product combinations as active products
            totalBrands: brands,
            totalColors: colors,
            totalTypes: productTypes
          },
          recentActivity
        }
      }
    } catch (error) {
      console.error('Dashboard stats error:', error)
      // Return fallback data if Supabase is down
      return {
        success: true,
        data: {
          stats: {
            totalOrders: 0,
            totalUsers: 0,
            activeProducts: 0,
            totalBrands: 0,
            totalColors: 0,
            totalTypes: 0
          },
          recentActivity: []
        }
      }
    }
  }
}
