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
      let query = supabase
        .from('brands')
        .select('id, name, type_id')
        .order('name')

      if (typeId) {
        query = query.eq('type_id', typeId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
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
}
