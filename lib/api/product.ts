import { supabase } from "@/lib/supabase";
import {
  Product,
  Brand,
  Color,
  ProductType,
  Size,
  BrandType,
  ColorBrandTypeWithDetails,
  BrandTypeWithDetails,
} from "@/types/product";

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("size_product").select(`
          id,
          size_id,
          brandT_id,
          sizes (
            id,
            value,
            brand_type (
              id,
              brand_id,
              type_id,
              brands (
                id,
                name,
                is_Active
              ),
              product_type (
                id,
                name,
                is_Active,
                is_onlyType
              )
            )
          ),
          brand_type (
            id,
            brands (
              id,
              name
            ),
            product_type (
              id,
              name,
              is_onlyType
            )
          )
        `);

      if (error) {
        throw error;
      }

      // Transform the data to match Product interface
      return (
        (data?.map((item) => ({
          id: item.id,
          product_name: `${item.brand_type?.[0]?.brands?.[0]?.name || "Unknown"} ${item.brand_type?.[0]?.product_type?.[0]?.name || "Product"} - ${item.sizes?.[0]?.value || "Size"}`,
          image: null, // No image in this table structure
          brand_id: item.brand_type?.[0]?.brands?.[0]?.id,
          color_id: null, // No color in this table
          product_type_id: item.brand_type?.[0]?.product_type?.[0]?.id,
          brand: item.brand_type?.[0]?.brands?.[0],
          color: null,
          product_type: item.brand_type?.[0]?.product_type?.[0],
          is_onlyType: item.brand_type?.[0]?.product_type?.[0]?.is_onlyType,
        })) as unknown as Product[]) || []
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      // Since there's no 'products' table, we'll get from size_product
      const { data, error } = await supabase
        .from("size_product")
        .select(
          `
          id,
          size_id,
          brandT_id,
          sizes (
            id,
            value,
            brand_type (
              id,
              brand_id,
              type_id,
              brands (
                id,
                name,
                is_Active
              ),
              product_type (
                id,
                name,
                is_Active,
                is_onlyType
              )
            )
          ),
          brand_type (
            id,
            brands (
              id,
              name
            ),
            product_type (
              id,
              name,
              is_onlyType
            )
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      // Transform the data to match Product interface
      if (data) {
        return {
          id: data.id,
          product_name: `${data.brand_type?.[0]?.brands?.[0]?.name || "Unknown"} ${data.brand_type?.[0]?.product_type?.[0]?.name || "Product"} - ${data.sizes?.[0]?.value || "Size"}`,
          image: null,
          brand_id: data.brand_type?.[0]?.brands?.[0]?.id,
          color_id: null,
          product_type_id: data.brand_type?.[0]?.product_type?.[0]?.id,
          brand: data.brand_type?.[0]?.brands?.[0],
          color: null,
          product_type: data.brand_type?.[0]?.product_type?.[0],
          is_onlyType: data.brand_type?.[0]?.product_type?.[0]?.is_onlyType,
        } as unknown as Product;
      }

      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  static async getBrands(typeId?: number) {
    try {
      if (typeId) {
        // Get brands that have the specified type_id in brand_type table
        const { data, error } = await supabase
          .from("brand_type")
          .select(
            `id,
            brand_id,
            type_id,
            brands(
              id,
              name,
              is_Active
            ),
            product_type (
              id,
              name,
              is_Active,
              is_onlyType
            )
          `,
          )
          .eq("type_id", typeId);

        if (error) {
          throw error;
        }
        return data.map((brandType) => {
          const brand = Array.isArray(brandType.brands)
            ? brandType.brands[0]
            : brandType.brands;

          return {
            id: brandType.brand_id,
            name: brand!.name,
            is_Active: brand!.is_Active,
            type_id: brandType.type_id,
          };
        });
      } else {
        // Get all brands with their associated types
        const { data, error } = await supabase
          .from("brands")
          .select(
            `
            id, 
            name, 
            is_Active,
            brand_type (
              type_id
            )
          `,
          )
          .order("name");

        if (error) {
          throw error;
        }

        // Transform data to include type_id from first association
        return (
          data?.map((brand) => ({
            ...brand,
            type_id: brand.brand_type?.[0]?.type_id || null,
          })) || []
        );
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  }

  static async createBrand(
    name: string,
    is_Active: boolean = true,
  ): Promise<Brand> {
    try {
      // Check if brand already exists (case-insensitive)
      const { data: existingBrand, error: checkError } = await supabase
        .from("brands")
        .select("id")
        .ilike("name", name)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingBrand) {
        throw new Error("Brand with this name already exists");
      }

      const { data, error } = await supabase
        .from("brands")
        .insert([{ name, is_Active }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create brand");
      }

      return data;
    } catch (error) {
      console.error("Error creating brand:", error);
      throw error;
    }
  }

  static async createBrandWithType(
    name: string,
    type_id: number,
    is_Active: boolean = true,
  ): Promise<{ brand: Brand; brandType: BrandType }> {
    try {
      // Create the brand first
      const brand = await this.createBrand(name, is_Active);

      // Then create the brand-type association
      const brandType = await this.createBrandType(brand.id, type_id);

      return { brand, brandType };
    } catch (error) {
      console.error("Error creating brand with type:", error);
      throw error;
    }
  }

  static async createBrandWithMultipleTypes(
    name: string,
    type_ids: number[],
    is_Active: boolean = true,
  ): Promise<{ brand: Brand; brandTypes: BrandType[] }> {
    try {
      // Create the brand first
      const brand = await this.createBrand(name, is_Active);

      // Then create all brand-type associations
      const brandTypes: BrandType[] = [];
      for (const type_id of type_ids) {
        const brandType = await this.createBrandType(brand.id, type_id);
        brandTypes.push(brandType);
      }

      return { brand, brandTypes };
    } catch (error) {
      console.error("Error creating brand with multiple types:", error);
      throw error;
    }
  }

  static async updateBrand(
    id: number,
    name?: string,
    is_Active?: boolean,
  ): Promise<Brand> {
    try {
      const updateData: { name?: string; is_Active?: boolean } = {};
      if (name !== undefined) {
        // Check if brand name already exists (excluding current brand, case-insensitive)
        const { data: existingBrand, error: checkError } = await supabase
          .from("brands")
          .select("id")
          .ilike("name", name)
          .neq("id", id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingBrand) {
          throw new Error("Brand with this name already exists");
        }

        updateData.name = name;
      }
      if (is_Active !== undefined) updateData.is_Active = is_Active;

      const { data, error } = await supabase
        .from("brands")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Brand not found");
      }

      return data;
    } catch (error) {
      console.error("Error updating brand:", error);
      throw error;
    }
  }

  static async updateBrandWithTypes(
    brand_id: number,
    type_ids: number[],
    name?: string,
    is_Active?: boolean,
  ): Promise<Brand> {
    let brandRes;
    try {
      // First, get existing brand-type associations for this brand
      const { data: existingAssociations, error: fetchError } = await supabase
        .from("brand_type")
        .select("type_id")
        .eq("brand_id", brand_id);

      if (fetchError) {
        throw fetchError;
      }

      const existingTypeIds =
        existingAssociations?.map((bt) => bt.type_id) || [];

      // Remove associations that are no longer needed
      const toRemove = existingTypeIds.filter((id) => !type_ids.includes(id));

      // Add new associations
      const toAdd = type_ids.filter((id) => !existingTypeIds.includes(id));

      // Delete removed associations
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("brand_type")
          .delete()
          .eq("brand_id", brand_id)
          .in("type_id", toRemove);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Add new associations
      if (toAdd.length > 0) {
        const newAssociations = toAdd.map((type_id) => ({
          brand_id,
          type_id,
        }));

        const { error: insertError } = await supabase
          .from("brand_type")
          .insert(newAssociations);

        if (insertError) {
          throw insertError;
        }
      }
      if (name || is_Active) {
        brandRes = await this.updateBrand(brand_id, name, is_Active);
      }

      if (!brandRes) {
        throw new Error("Failed to update brand");
      }

      // Return updated brand
      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("*")
        .eq("id", brand_id)
        .single();

      if (brandError || !brand) {
        throw new Error("Failed to update brand");
      }

      return brand;
    } catch (error) {
      console.error("Error updating brand with types:", error);
      throw error;
    }
  }

  static async deleteBrand(id: number): Promise<void> {
    try {
      // First delete all brand-type associations for this brand
      const { error: brandTypeError } = await supabase
        .from("brand_type")
        .delete()
        .eq("brand_id", id);

      if (brandTypeError) {
        console.error(
          "Error deleting brand-type associations:",
          brandTypeError,
        );
        throw brandTypeError;
      }

      // Then delete the brand
      const { error } = await supabase.from("brands").delete().eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      throw error;
    }
  }

  static async getColors(): Promise<Color[]> {
    try {
      const { data, error } = await supabase
        .from("colors")
        .select("id, value, is_Active")
        .order("value");

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching colors:", error);
      throw error;
    }
  }

  static async createColor(
    value: string,
    is_Active: boolean = true,
  ): Promise<Color> {
    try {
      // Check if color already exists (case-insensitive)
      const { data: existingColor, error: checkError } = await supabase
        .from("colors")
        .select("id")
        .ilike("value", value)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingColor) {
        throw new Error("Color with this value already exists");
      }

      const { data, error } = await supabase
        .from("colors")
        .insert([{ value, is_Active }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create color");
      }

      return data;
    } catch (error) {
      console.error("Error creating color:", error);
      throw error;
    }
  }

  static async updateColor(
    id: string,
    value?: string,
    is_Active?: boolean,
  ): Promise<Color> {
    try {
      const updateData: { value?: string; is_Active?: boolean } = {};
      if (value !== undefined) {
        // Check if color value already exists (excluding current color, case-insensitive)
        const { data: existingColor, error: checkError } = await supabase
          .from("colors")
          .select("id")
          .ilike("value", value)
          .neq("id", id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingColor) {
          throw new Error("Color with this value already exists");
        }

        updateData.value = value;
      }
      if (is_Active !== undefined) updateData.is_Active = is_Active;

      const { data, error } = await supabase
        .from("colors")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Color not found");
      }

      return data;
    } catch (error) {
      console.error("Error updating color:", error);
      throw error;
    }
  }

  static async deleteColor(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("colors").delete().eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting color:", error);
      throw error;
    }
  }

  static async getProductTypes(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from("product_type")
        .select("id, name, is_onlyType, is_Active")
        .order("name");

      if (error) {
        console.error("Error fetching product types:", error);
        // Return fallback data if Supabase is down
        return [
          { id: 1, name: "T-Shirt" },
          { id: 2, name: "Hoodie" },
          { id: 3, name: "Mug" },
        ];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching product types:", error);
      // Return fallback data if there's a network error
      return [
        { id: 1, name: "T-Shirt" },
        { id: 2, name: "Hoodie" },
        { id: 3, name: "Mug" },
      ];
    }
  }

  static async createProductType(
    name: string,
    is_Active: boolean = true,
    is_onlyType: boolean = false,
  ): Promise<ProductType> {
    try {
      // Check if product type already exists (case-insensitive)
      const { data: existingProductType, error: checkError } = await supabase
        .from("product_type")
        .select("id")
        .ilike("name", name)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingProductType) {
        throw new Error("Product type with this name already exists");
      }

      const { data: productType, error } = await supabase
        .from("product_type")
        .insert([{ name, is_Active, is_onlyType }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!productType) {
        throw new Error("Failed to create product type");
      }

      if (productType.is_onlyType) {
        const { error: brandError } = await supabase
          .from("brand_type")
          .insert([
            {
              brand_id: null,
              type_id: productType.id
            }
          ]);

        if (brandError) {
          console.error("Error inserting into brand_type:", brandError);
        }
      }

      return productType;
    } catch (error) {
      console.error("Error creating product type:", error);
      throw error;
    }
  }

  static async updateProductType(
    id: string,
    name?: string,
    is_Active?: boolean,
    is_onlyType?: boolean,
  ): Promise<ProductType> {
    try {
      const updateData: { name?: string; is_Active?: boolean; is_onlyType?: boolean } = {};
      if (name !== undefined) {
        // Check if product type name already exists (excluding current product type, case-insensitive)
        const { data: existingProductType, error: checkError } = await supabase
          .from("product_type")
          .select("id")
          .ilike("name", name)
          .neq("id", id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingProductType) {
          throw new Error("Product type with this name already exists");
        }

        updateData.name = name;
      }
      if (is_Active !== undefined) updateData.is_Active = is_Active;
      if (is_onlyType !== undefined) updateData.is_onlyType = is_onlyType;

      const { data: productType, error } = await supabase
        .from("product_type")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!productType) {
        throw new Error("Product type not found");
      }

      if (productType.is_onlyType) {
        // Check if already exists
        const { data: existing } = await supabase
          .from("brand_type")
          .select("id")
          .eq("type_id", id)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabase
            .from("brand_type")
            .insert([
              {
                brand_id: null,
                type_id: id
              }
            ]);

          if (insertError) throw insertError;
        }
      }

      return productType;
    } catch (error) {
      console.error("Error updating product type:", error);
      throw error;
    }
  }

  static async deleteProductType(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("product_type")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting product type:", error);
      throw error;
    }
  }

  static async getSizes(): Promise<Size[]> {
    try {
      const { data, error } = await supabase
        .from("sizes")
        .select("id, value, is_Active")
        .order("value");

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching sizes:", error);
      throw error;
    }
  }

  // Update Size
  static async createSize(
    value: string,
    is_Active: boolean = true,
  ): Promise<Size> {
    try {
      // Check if size already exists (case-insensitive)
      const { data: existingSize, error: checkError } = await supabase
        .from("sizes")
        .select("id")
        .ilike("value", value)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingSize) {
        throw new Error("Size with this value already exists");
      }

      const { data, error } = await supabase
        .from("sizes")
        .insert([{ value, is_Active }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create size");
      }

      return data;
    } catch (error) {
      console.error("Error creating size:", error);
      throw error;
    }
  }

  static async updateSize(
    id: string,
    value?: string,
    is_Active?: boolean,
  ): Promise<Size> {
    try {
      const updateData: { value?: string; is_Active?: boolean } = {};
      if (value !== undefined) {
        // Check if the size value already exists (excluding current size, case-insensitive)
        const { data: existingSize, error: checkError } = await supabase
          .from("sizes")
          .select("id")
          .ilike("value", value)
          .neq("id", id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingSize) {
          throw new Error("Size with this value already exists");
        }

        updateData.value = value;
      }
      if (is_Active !== undefined) updateData.is_Active = is_Active;

      const { data, error } = await supabase
        .from("sizes")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Size not found");
      }

      return data;
    } catch (error) {
      console.error("Error updating size:", error);
      throw error;
    }
  }

  static async deleteSize(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("sizes").delete().eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting size:", error);
      throw error;
    }
  }

  static async getSizesByProductType(
    typeId?: string,
    brandId?: string,
  ): Promise<Size[]> {
    try {
      if (typeId && brandId) {
        // Filter by both type and brand through brand_type relationship
        const { data: brandTypeData, error: brandTypeError } = await supabase
          .from("brand_type")
          .select("id")
          .eq("type_id", typeId)
          .eq("brand_id", brandId)
          .single();

        if (brandTypeError || !brandTypeData) {
          return []; // No matching brand-type combination
        }

        // Get sizes for this specific brand-type combination using brandT_id
        const { data, error } = await supabase
          .from("size_product")
          .select(
            `
            size_id,
            sizes (
              id,
              value,
              is_Active
            )
          `,
          )
          .eq("brandT_id", brandTypeData.id);

        if (error) {
          throw error;
        }

        return data?.flatMap((item) => item.sizes).filter(Boolean) || [];
      } else if (typeId) {
        // Filter by type only - get all brand_type records that have this type
        const { data: brandTypeData, error: brandTypeError } = await supabase
          .from("brand_type")
          .select("id")
          .eq("type_id", typeId);

        if (brandTypeError) {
          throw brandTypeError;
        }

        // If no brands have this type, return empty
        if (!brandTypeData || brandTypeData.length === 0) {
          return [];
        }

        // Get sizes for all brand_type records that have this type
        const brandTypeIds = brandTypeData.map((item) => item.id);
        const { data, error } = await supabase
          .from("size_product")
          .select(
            `
            size_id,
            sizes (
              id,
              value,
              is_Active
            )
          `,
          )
          .in("brandT_id", brandTypeIds);

        if (error) {
          throw error;
        }

        return data?.flatMap((item) => item.sizes).filter(Boolean) || [];
      } else {
        // No filtering - return all sizes
        const { data, error } = await supabase.from("size_product").select(`
            size_id,
            sizes (
              id,
              value,
              is_Active
            )
          `);

        if (error) {
          throw error;
        }

        return data?.flatMap((item) => item.sizes).filter(Boolean) || [];
      }
    } catch (error) {
      console.error("Error fetching sizes by product type:", error);
      throw error;
    }
  }

  static async getProductCombinationsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("size_product")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error fetching product combinations count:", error);
      return 0;
    }
  }

  static async getDashboardStats() {
    try {
      // Import OrderService to avoid circular dependency
      const { OrderService } = await import("@/lib/api/order");

      // Get all data in parallel for better performance
      const [
        customers,
        productOrders,
        brands,
        colors,
        productTypes,
        productSizes,
      ] = await Promise.all([
        // Get customers count
        OrderService.getCustomersCount(),
        // Get orders count
        OrderService.getProductOrdersCount(),
        // Get brands count
        this.getBrands().then((brands) => brands.length),
        // Get colors count
        this.getColors().then((colors) => colors.length),
        // Get product types count
        this.getProductTypes().then((types) => types.length),
        // Get product combinations count (instead of products)
        this.getProductCombinationsCount(),
      ]);

      // Get recent activity
      const recentActivity = await OrderService.getRecentActivity();

      return {
        success: true,
        data: {
          stats: {
            totalOrders: productOrders,
            totalUsers: customers,
            activeProducts: productSizes, // Using product combinations as active products
            totalBrands: brands,
            totalColors: colors,
            totalTypes: productTypes,
          },
          recentActivity,
        },
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
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
            totalTypes: 0,
          },
          recentActivity: [],
        },
      };
    }
  }

  // size_product table logic
  static async getSizeProduct() {
    try {
      const { data, error } = await supabase
        .from("size_product")
        .select(
          "id, size_id, brandT_id, sizes!inner(value), brand_type!inner(id, brands!inner(name), product_type!inner(name))",
        );

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching product types:", error);
      return [];
    }
  }

  static async createSizeProduct(brandT_id: number, size_id: number) {
    try {
      // Validate brand_type exists
      const { data: brandType, error: brandTypeError } = await supabase
        .from("brand_type")
        .select("id")
        .eq("id", brandT_id)
        .single();

      if (brandTypeError || !brandType) {
        throw new Error("Brand type not found");
      }

      // Validate size exists
      const { data: size, error: sizeError } = await supabase
        .from("sizes")
        .select("id")
        .eq("id", size_id)
        .single();

      if (sizeError || !size) {
        throw new Error("Size not found");
      }

      // Check if combination already exists
      const { data: existing, error: existingError } = await supabase
        .from("size_product")
        .select("id")
        .eq("brandT_id", brandT_id)
        .eq("size_id", size_id)
        .single();

      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }

      if (existing) {
        throw new Error("Size product combination already exists");
      }

      const { data, error } = await supabase
        .from("size_product")
        .insert([{ brandT_id, size_id }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to create size product");

      return data;
    } catch (error) {
      console.error("Error creating size product:", error);
      throw error;
    }
  }

  static async deleteSizeProduct(id: number) {
    try {
      const { error } = await supabase
        .from("size_product")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting size product:", error);
      throw error;
    }
  }

  static async batchCreateSizeProducts(
    items: { brandT_id: number; size_id: number }[],
  ) {
    try {
      if (items.length === 0) return [];

      // Validate all brand_types exist
      const brandTypeIds = [...new Set(items.map((item) => item.brandT_id))];
      const { data: existingBrandTypes, error: brandTypeError } = await supabase
        .from("brand_type")
        .select("id")
        .in("id", brandTypeIds);

      if (brandTypeError) throw brandTypeError;
      if (
        !existingBrandTypes ||
        existingBrandTypes.length !== brandTypeIds.length
      ) {
        throw new Error("One or more brand types not found");
      }

      // Validate all sizes exist
      const sizeIds = [...new Set(items.map((item) => item.size_id))];
      const { data: existingSizes, error: sizeError } = await supabase
        .from("sizes")
        .select("id")
        .in("id", sizeIds);

      if (sizeError) throw sizeError;
      if (!existingSizes || existingSizes.length !== sizeIds.length) {
        throw new Error("One or more sizes not found");
      }

      // Filter out existing combinations
      const { data: existing, error: existingError } = await supabase
        .from("size_product")
        .select("brandT_id, size_id")
        .or(
          items
            .map(
              (item) =>
                `brandT_id.eq.${item.brandT_id},size_id.eq.${item.size_id}`,
            )
            .join(","),
        );

      if (existingError) throw existingError;

      const existingSet = new Set(
        (existing || []).map((item) => `${item.brandT_id}-${item.size_id}`),
      );

      const newItems = items.filter(
        (item) => !existingSet.has(`${item.brandT_id}-${item.size_id}`),
      );

      if (newItems.length === 0) return [];

      const { data, error } = await supabase
        .from("size_product")
        .insert(newItems)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error batch creating size products:", error);
      throw error;
    }
  }

  static async batchDeleteSizeProducts(ids: number[]) {
    try {
      if (ids.length === 0) return { deleted: 0 };

      const { error, count } = await supabase
        .from("size_product")
        .delete()
        .in("id", ids);

      if (error) throw error;
      return { deleted: count || 0 };
    } catch (error) {
      console.error("Error batch deleting size products:", error);
      throw error;
    }
  }

  // brand_type logic
  static async getBrandTypes(): Promise<
    (BrandType & { brand_name?: string; product_type_name?: string })[]
  > {
    try {
      const { data, error } = await supabase
        .from("brand_type")
        .select(
          `
          id, 
          brand_id, 
          type_id,
          brands (
            name
          ),
          product_type (
            name
          )
        `,
        )
        .order("id")
        .overrideTypes<BrandTypeWithDetails[]>();

      if (error) {
        throw error;
      }

      return (
        data?.map((item) => ({
          ...item,
          brand_name: item.brands?.name,
          product_type_name: item.product_type?.name,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching brand types:", error);
      throw error;
    }
  }

  static async createBrandType(
    brand_id: number,
    type_id: number,
  ): Promise<BrandType> {
    try {
      // Validate brand exists
      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("id")
        .eq("id", brand_id)
        .single();

      if (brandError || !brand) {
        throw new Error("Brand not found");
      }

      // Validate type exists
      const { data: type, error: typeError } = await supabase
        .from("product_type")
        .select("id")
        .eq("id", type_id)
        .single();

      if (typeError || !type) {
        throw new Error("Product type not found");
      }
      // Check if brand and product type combination already exists
      const { data: existingBrandType, error: checkError } = await supabase
        .from("brand_type")
        .select("id")
        .eq("brand_id", brand_id)
        .eq("type_id", type_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingBrandType) {
        throw new Error(
          "Brand type with this brand_id and type_id already exists",
        );
      }

      const { data, error } = await supabase
        .from("brand_type")
        .insert([{ brand_id, type_id }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create brand type");
      }

      return data;
    } catch (error) {
      console.error("Error creating brand type:", error);
      throw error;
    }
  }

  static async updateBrandType(
    id: number,
    brand_id: number,
    type_id: number,
  ): Promise<BrandType> {
    try {
      // Validate brand exists
      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("id")
        .eq("id", brand_id)
        .single();

      if (brandError || !brand) {
        throw new Error("Brand not found");
      }

      // Validate type exists
      const { data: type, error: typeError } = await supabase
        .from("product_types")
        .select("id")
        .eq("id", type_id)
        .single();

      if (typeError || !type) {
        throw new Error("Type not found");
      }
      // Check if brand and product type combination already exists
      const { data: existingBrandType, error: checkError } = await supabase
        .from("brand_type")
        .select("id")
        .eq("brand_id", brand_id)
        .eq("type_id", type_id)
        .neq("id", id) // Exclude current record
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingBrandType) {
        throw new Error(
          "Brand type with this brand_id and type_id already exists",
        );
      }

      const { data, error } = await supabase
        .from("brand_type")
        .update({ brand_id, type_id })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to update brand type");
      }

      return data;
    } catch (error) {
      console.error("Error updating brand type:", error);
      throw error;
    }
  }

  static async deleteBrandType(id: number): Promise<void> {
    try {
      const { error } = await supabase.from("brand_type").delete().eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting brand type:", error);
      throw error;
    }
  }
  // Color BrandType logic
  static async getColorBrandTypes() {
    try {
      const { data, error } = await supabase
        .from("color_products")
        .select(
          `
          id, 
          brandT_id, 
          color_id,
          brand_type (
            id,
            brand_id,
            brands!inner (
              name
            ),
            product_type!inner (
              name
            )
          ),
          colors (
            value
          )
        `,
        )
        .order("id")
        .overrideTypes<ColorBrandTypeWithDetails[]>();

      if (error) {
        throw error;
      }

      return (
        data?.map((item: ColorBrandTypeWithDetails) => ({
          ...item,
          brand_name: item.brand_type.brands.name ?? "",
          color_name: item.colors?.value ?? "",
        })) ?? []
      );
    } catch (error) {
      console.error("Error fetching brand types:", error);
      throw error;
    }
  }

  static async createColorBrandType(
    brandT_id: number,
    color_id: number,
  ): Promise<BrandType> {
    try {
      // Validate color exists
      const { data: color, error: colorError } = await supabase
        .from("colors")
        .select("id")
        .eq("id", color_id)
        .single();

      if (colorError || !color) {
        throw new Error("Color not found");
      }

      // Validate brand_type exists
      const { data: brand_type, error: brand_typeError } = await supabase
        .from("brand_type")
        .select("id")
        .eq("id", brandT_id)
        .single();

      if (brand_typeError || !brand_type) {
        throw new Error("Product type not found");
      }
      // Check if brand and product type combination already exists
      const { data: existingBrandType, error: checkError } = await supabase
        .from("color_products")
        .select("id")
        .eq("brandT_id", brandT_id)
        .eq("color_id", color_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingBrandType) {
        throw new Error(
          "Color Product with this brandT_id and color_id already exists",
        );
      }

      const { data, error } = await supabase
        .from("color_products")
        .insert([{ brandT_id, color_id }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create brand type");
      }

      return data;
    } catch (error) {
      console.error("Error creating brand type:", error);
      throw error;
    }
  }

  static async updateColorBrandType(
    id: number,
    brandT_id: number,
    color_id: number,
  ): Promise<BrandType> {
    try {
      // Validate brand exists
      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("id")
        .eq("id", brandT_id)
        .single();

      if (brandError || !brand) {
        throw new Error("Brand not found");
      }

      // Validate color exists
      const { data: color, error: colorError } = await supabase
        .from("colors")
        .select("id")
        .eq("id", color_id)
        .single();

      if (colorError || !color) {
        throw new Error("Color not found");
      }
      // Check if brand and product type combination already exists
      const { data: existingBrandType, error: checkError } = await supabase
        .from("color_products")
        .select("id")
        .eq("brandT_id", brandT_id)
        .eq("color_id", color_id)
        .neq("id", id) // Exclude current record
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingBrandType) {
        throw new Error(
          "Color Product with this brandT_id and color_id already exists",
        );
      }

      const { data, error } = await supabase
        .from("color_products")
        .update({ brandT_id, color_id })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to update color brand type");
      }

      return data;
    } catch (error) {
      console.error("Error updating color brand type:", error);
      throw error;
    }
  }

  static async deleteColorBrandType(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("color_products")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting color brand type:", error);
      throw error;
    }
  }

  static async batchCreateColorProducts(
    items: { brandT_id: number; color_id: number }[],
  ) {
    try {
      if (items.length === 0) return [];

      // Validate all brand_types exist
      const brandTypeIds = [...new Set(items.map((item) => item.brandT_id))];
      const { data: existingBrandTypes, error: brandTypeError } = await supabase
        .from("brand_type")
        .select("id")
        .in("id", brandTypeIds);

      if (brandTypeError) throw brandTypeError;
      if (
        !existingBrandTypes ||
        existingBrandTypes.length !== brandTypeIds.length
      ) {
        throw new Error("One or more brand types not found");
      }

      // Validate all colors exist
      const colorIds = [...new Set(items.map((item) => item.color_id))];
      const { data: existingColors, error: colorError } = await supabase
        .from("colors")
        .select("id")
        .in("id", colorIds);

      if (colorError) throw colorError;
      if (!existingColors || existingColors.length !== colorIds.length) {
        throw new Error("One or more colors not found");
      }

      // Filter out existing combinations
      const { data: existing, error: existingError } = await supabase
        .from("color_products")
        .select("brandT_id, color_id")
        .or(
          items
            .map(
              (item) =>
                `brandT_id.eq.${item.brandT_id},color_id.eq.${item.color_id}`,
            )
            .join(","),
        );

      if (existingError) throw existingError;

      const existingSet = new Set(
        (existing || []).map((item) => `${item.brandT_id}-${item.color_id}`),
      );

      const newItems = items.filter(
        (item) => !existingSet.has(`${item.brandT_id}-${item.color_id}`),
      );

      if (newItems.length === 0) return [];

      const { data, error } = await supabase
        .from("color_products")
        .insert(newItems)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error batch creating color products:", error);
      throw error;
    }
  }

  static async batchDeleteColorProducts(ids: number[]) {
    try {
      if (ids.length === 0) return { deleted: 0 };

      const { error, count } = await supabase
        .from("color_products")
        .delete()
        .in("id", ids);

      if (error) throw error;
      return { deleted: count || 0 };
    } catch (error) {
      console.error("Error batch deleting color products:", error);
      throw error;
    }
  }
}
