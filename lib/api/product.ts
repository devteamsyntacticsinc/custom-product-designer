import { supabase } from "@/lib/supabase"
import { Product, Brand, Color, ProductType, Size } from "@/types/product"

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          image,
          brand_id,
          color_id,
          product_type_id,
          brand (
            id,
            name
          ),
          color (
            id,
            value
          ),
          product_type (
            id,
            name
          )
        `)

      if (error) {
        throw error
      }

      return (data as unknown as Product[]) || []
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          image,
          brand_id,
          color_id,
          product_type_id,
          brand (
            id,
            name
          ),
          color (
            id,
            value
          ),
          product_type (
            id,
            name
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return data as unknown as Product || null
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
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching product types:', error)
      throw error
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
}
