import { supabase } from "@/lib/supabase"
import { Product } from "@/types/product"

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          image,
          category_id,
          product_category (
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
          category_id,
          product_category (
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
}
