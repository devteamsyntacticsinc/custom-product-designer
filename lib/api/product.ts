import { supabase } from "@/lib/supabase";
import { Product, Brand, Color, ProductType, Size } from "@/types/product";

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("size_product").select(`
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
        } as unknown as Product;
      }

      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  static async getBrands(typeId?: string): Promise<Brand[]> {
    try {
      if (typeId) {
        // Get brands that have the specified type_id in brand_type table
        const { data, error } = await supabase
          .from("brand_type")
          .select(
            `
            brand_id,
            brands (
              id,
              name,
              is_Active
            )
          `,
          )
          .eq("type_id", typeId);

        if (error) {
          throw error;
        }

        return (
          (data
            ?.map((item) => item.brands)
            .filter(Boolean)
            .flat() as unknown as Brand[]) || []
        );
      } else {
        // Get all brands
        const { data, error } = await supabase
          .from("brands")
          .select("id, name, is_Active")
          .order("name");

        if (error) {
          throw error;
        }

        return data || [];
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

  static async updateBrand(
    id: string,
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

  static async deleteBrand(id: string): Promise<void> {
    try {
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
        .select("id, name, is_Active")
        .order("name");

      if (error) {
        console.error("Error fetching product types:", error);
        // Return fallback data if Supabase is down
        return [
          { id: "1", name: "T-Shirt" },
          { id: "2", name: "Hoodie" },
          { id: "3", name: "Mug" },
        ];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching product types:", error);
      // Return fallback data if there's a network error
      return [
        { id: "1", name: "T-Shirt" },
        { id: "2", name: "Hoodie" },
        { id: "3", name: "Mug" },
      ];
    }
  }

  static async createProductType(
    name: string,
    is_Active: boolean = true,
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

      const { data, error } = await supabase
        .from("product_type")
        .insert([{ name, is_Active }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create product type");
      }

      return data;
    } catch (error) {
      console.error("Error creating product type:", error);
      throw error;
    }
  }

  static async updateProductType(
    id: string,
    name?: string,
    is_Active?: boolean,
  ): Promise<ProductType> {
    try {
      const updateData: { name?: string; is_Active?: boolean } = {};
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

      const { data, error } = await supabase
        .from("product_type")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Product type not found");
      }

      return data;
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
  ): Promise<Color> {
    try {
      // Check if size already exists (case-insensitive)
      const { data: existingSize, error: checkError } = await supabase
        .from("size")
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
      console.error("Error creating color:", error);
      throw error;
    }
  }

  static async updateSize(
    id: string,
    value?: string,
    is_Active?: boolean,
  ): Promise<Color> {
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
              value
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
              value
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
              value
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
}
