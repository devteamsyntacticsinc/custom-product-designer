import { supabase } from "@/lib/supabase"
import { Product, Brand, Color, ProductType, Size, OrderData, OrderResult } from "@/types/product"

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

  // Order-related methods
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
          throw error
        }
      }

      return true
    } catch (error) {
      console.error('Error creating product sizes:', error)
      throw error
    }
  }

  static async uploadProductImages(productOrderId: string, assets: OrderData['assets']) {
    try {
      console.log('Starting uploadProductImages with assets:', assets);
      
      const placementMap: Record<string, string> = {
        "front-top-left": "Front - Top Left",
        "front-center": "Front - Center", 
        "back-top": "Back - Top",
        "back-bottom": "Back - Bottom"
      };

      const imageInserts = [];
      for (const [key, file] of Object.entries(assets)) {
        console.log(`Processing asset ${key}:`, file);
        if (file && file instanceof File) {
          // Upload to Supabase Storage
          const fileName = `${Date.now()}-${file.name}`;
          console.log('Uploading file:', fileName);
          
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

          console.log('File uploaded successfully, URL:', urlData.publicUrl);

          imageInserts.push({
            productO_id: productOrderId,
            url: urlData.publicUrl,
            place: placementMap[key] || key,
          });
        } else {
          console.log(`No file found for ${key} or invalid file type`);
        }
      }

      console.log('Final imageInserts array:', imageInserts);

      if (imageInserts.length > 0) {
        console.log('Inserting images into product_images table...');
        const { error } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (error) {
          console.error('Error inserting product images:', error);
          throw error
        }
        console.log('Successfully inserted images into product_images table');
      } else {
        console.log('No images to insert');
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

      // Get brand type ID
      const brandTypeData = await this.getBrandTypeId(orderData.brand, orderData.productType);

      // Create product order
      const productOrderData = await this.createProductOrder(
        customerData.id,
        brandTypeData.id,
        orderData.color
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
}
