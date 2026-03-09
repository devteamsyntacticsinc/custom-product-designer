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
  ImageProducts,
} from "@/types/product";

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("size_product").select(`
          id,
          size_id,
          product_id,
          sizes (
            id,
            value,
            products (
              id,
              brand_id,
              product_type_id,
              brands (
                id,
                name,
                is_Active
              ),
              product_type (
                id,
                name,
                is_Active,
                is_hasBrand,
                is_hasColor
              )
            )
          ),
          products (
            id,
            brands (
              id,
              name
            ),
            product_type (
              id,
              name,
              is_hasBrand,
              is_hasColor
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
          product_name: `${item.products?.[0]?.brands?.[0]?.name || "Unknown"} ${item.products?.[0]?.product_type?.[0]?.name || "Product"} - ${item.sizes?.[0]?.value || "Size"}`,
          image: null, // No image in this table structure
          brand_id: item.products?.[0]?.brands?.[0]?.id,
          color_id: null, // No color in this table
          product_type_id: item.products?.[0]?.product_type?.[0]?.id,
          brand: item.products?.[0]?.brands?.[0],
          color: null,
          product_type: item.products?.[0]?.product_type?.[0],
          is_hasBrand: item.products?.[0]?.product_type?.[0]?.is_hasBrand,
          is_hasColor: item.products?.[0]?.product_type?.[0]?.is_hasColor,
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
          product_id,
          sizes (
            id,
            value,
            products (
              id,
              brand_id,
              product_type_id,
              brands (
                id,
                name,
                is_Active
              ),
              product_type (
                id,
                name,
                is_Active,
                is_hasBrand,
                is_hasColor
              )
            )
          ),
          products (
            id,
            brands (
              id,
              name
            ),
            product_type (
              id,
              name,
              is_hasBrand,
              is_hasColor
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
          product_name: `${data.products?.[0]?.brands?.[0]?.name || "Unknown"} ${data.products?.[0]?.product_type?.[0]?.name || "Product"} - ${data.sizes?.[0]?.value || "Size"}`,
          image: null,
          brand_id: data.products?.[0]?.brands?.[0]?.id,
          color_id: null,
          product_type_id: data.products?.[0]?.product_type?.[0]?.id,
          brand: data.products?.[0]?.brands?.[0],
          color: null,
          product_type: data.products?.[0]?.product_type?.[0],
          is_hasBrand: data.products?.[0]?.product_type?.[0]?.is_hasBrand,
          is_hasColor: data.products?.[0]?.product_type?.[0]?.is_hasColor,
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
        // Get brands that have the specified product_type_id in products table
        const { data, error } = await supabase
          .from("products")
          .select(
            `id,
            brand_id,
            product_type_id,
            brands(
              id,
              name,
              is_Active
            ),
            product_type (
              id,
              name,
              is_Active,
              is_hasBrand,
                is_hasColor
            )
          `,
          )
          .eq("product_type_id", typeId);

        if (error) {
          throw error;
        }

        return data.map((product) => {
          const brand = Array.isArray(product.brands)
            ? product.brands[0]
            : product.brands;

          if (product.brand_id === null) {
            return {
              id: 0,
              name: "",
              is_Active: false,
              type_id: product.product_type_id,
            };
          }

          return {
            id: product.brand_id,
            name: brand.name,
            is_Active: brand.is_Active,
            type_id: product.product_type_id,
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
            products (
              product_type_id
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
            type_id: brand.products?.[0]?.product_type_id || null,
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
      //Get existing brand-product associations for this brand
      const { data: existingAssociations, error: fetchError } = await supabase
        .from("products")
        .select("product_type_id")
        .eq("brand_id", brand_id);

      if (fetchError) {
        throw fetchError;
      }

      const existingTypeIds =
        existingAssociations?.map((product) => product.product_type_id) || [];

      // Remove associations that are no longer needed
      const toRemove = existingTypeIds.filter((id) => !type_ids.includes(id));

      // Add new associations
      const toAdd = type_ids.filter((id) => !existingTypeIds.includes(id));

      // Delete removed associations
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("products")
          .delete()
          .eq("brand_id", brand_id)
          .in("product_type_id", toRemove);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Add new associations with null brand claiming logic
      if (toAdd.length > 0) {
        for (const product_type_id of toAdd) {
          // Check if brand+type combination already exists
          const { data: existingProduct, error: checkError } = await supabase
            .from("products")
            .select("id")
            .eq("brand_id", brand_id)
            .eq("product_type_id", product_type_id)
            .maybeSingle();

          if (checkError) {
            throw checkError;
          }

          if (existingProduct) {
            continue; // Skip if already exists
          }

          // Check for null brand record to claim
          const { data: hasNullBrandProduct, error: checkNullError } =
            await supabase
              .from("products")
              .select("id")
              .is("brand_id", null)
              .eq("product_type_id", product_type_id)
              .maybeSingle();

          if (checkNullError) {
            throw checkNullError;
          }

          if (hasNullBrandProduct) {
            // Claim the existing null record
            const { error: updateError } = await supabase
              .from("products")
              .update({ brand_id })
              .eq("id", hasNullBrandProduct.id);

            if (updateError) {
              throw updateError;
            }
          } else {
            // Create new brand-product association
            const { error: insertError } = await supabase
              .from("products")
              .insert([{ brand_id, product_type_id }]);

            if (insertError) {
              throw insertError;
            }
          }
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
      // First delete all brand-product associations for this brand
      const { error: brandProductError } = await supabase
        .from("products")
        .delete()
        .eq("brand_id", id);

      if (brandProductError) {
        console.error(
          "Error deleting brand-product associations:",
          brandProductError,
        );
        throw brandProductError;
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

  static async getProductTypes(): Promise<
    (Omit<ProductType, "image_products"> & {
      image_products?: Pick<ImageProducts, "filepath" | "is_hasBack" | "id">[];
    })[]
  > {
    try {
      const { data, error } = await supabase
        .from("product_type")
        .select(
          "id, name, is_Active, is_hasColor, is_hasBrand, image_products(filepath, is_hasBack, id)",
        )
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
    is_hasBrand: boolean = false,
    is_hasColor: boolean = false,
    images: { file?: File; filepath?: string; is_hasBack: boolean }[],
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
        .insert([{ name, is_Active, is_hasBrand, is_hasColor }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!productType) {
        throw new Error("Failed to create product type");
      }

      if (productType.is_hasBrand || productType.is_hasColor) {
        const { error: brandError } = await supabase.from("products").insert([
          {
            brand_id: null,
            product_type_id: productType.id,
          },
        ]);

        if (brandError) {
          console.error("Error inserting into products:", brandError);
        }
      }

      // Upload images if provided
      if (images && images.length > 0) {
        await this.uploadImageProductType(productType.id.toString(), images);
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
    is_hasBrand?: boolean,
    is_hasColor?: boolean,
    images?: { file?: File; filepath?: string; is_hasBack: boolean }[],
    imagesToDelete?: number[],
  ): Promise<ProductType> {
    try {
      const updateData: {
        name?: string;
        is_Active?: boolean;
        is_hasBrand?: boolean;
        is_hasColor?: boolean;
      } = {};
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
      if (is_hasBrand !== undefined) updateData.is_hasBrand = is_hasBrand;
      if (is_hasColor !== undefined) updateData.is_hasColor = is_hasColor;

      // Update product type
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

      if (productType.is_hasBrand || productType.is_hasColor) {
        // Check if already exists
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("product_type_id", id)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabase
            .from("products")
            .insert([
              {
                brand_id: null,
                product_type_id: id,
              },
            ]);

          if (insertError) throw insertError;
        }
      }

      // Delete specified images first
      if (imagesToDelete && imagesToDelete.length > 0) {
        await this.deleteProductTypeImages(imagesToDelete);
      }

      // Upload images if provided
      if (images && images.length > 0) {
        await this.uploadImageProductType(id, images);
      }

      return productType;
    } catch (error) {
      console.error("Error updating product type:", error);
      throw error;
    }
  }

  static async deleteProductType(
    id: string,
    imagesToDelete: number[],
  ): Promise<void> {
    try {
      // First, get the product type details to check if it has brand or color
      const { data: productType, error: fetchError } = await supabase
        .from("product_type")
        .select("id, name, is_hasBrand, is_hasColor")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!productType) {
        throw new Error("Product type not found");
      }

      // Delete specified images first
      if (imagesToDelete && imagesToDelete.length > 0) {
        await this.deleteProductTypeImages(imagesToDelete);
      }

      if (productType.is_hasBrand || productType.is_hasColor) {
        const { data: nullProduct, error: productError } = await supabase
          .from("products")
          .select("id")
          .is("brand_id", null)
          .eq("product_type_id", id)
          .maybeSingle();

        if (productError) {
          throw productError;
        }

        if (nullProduct) {
          const productId = nullProduct.id;

          const { count: sizeProductCount, error: sizeProductError } =
            await supabase
              .from("size_product")
              .select("*", { count: "exact", head: true })
              .eq("product_id", productId);

          if (sizeProductError) {
            throw sizeProductError;
          }

          const { count: colorProductCount, error: colorProductError } =
            await supabase
              .from("color_products")
              .select("*", { count: "exact", head: true })
              .eq("product_id", productId);

          if (colorProductError) {
            throw colorProductError;
          }

          const { count: productOrderCount, error: productOrderError } =
            await supabase
              .from("invoices")
              .select("*", { count: "exact", head: true })
              .eq("product_id", productId);

          if (productOrderError) {
            throw productOrderError;
          }

          if (
            sizeProductCount === 0 &&
            colorProductCount === 0 &&
            productOrderCount === 0
          ) {
            const { error: deleteProductError } = await supabase
              .from("products")
              .delete()
              .eq("id", productId);

            if (deleteProductError) {
              throw deleteProductError;
            }
          }
        }
      }

      // Finally, delete the product type
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

  static async uploadImageProductType(
    productTypeId: string,
    assets: { file?: File; filepath?: string; is_hasBack: boolean }[],
  ) {
    try {
      const imageInserts = [];
      for (const asset of assets) {
        if (asset && asset.file instanceof File) {
          // Upload to Supabase Storage
          const fileName = `${Date.now()}-${asset.file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, asset.file);

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          imageInserts.push({
            product_type_id: productTypeId,
            filepath: urlData.publicUrl,
            is_hasBack: asset.is_hasBack,
          });
        } else if (asset && asset.filepath) {
          // Use existing filepath
          imageInserts.push({
            product_type_id: productTypeId,
            filepath: asset.filepath,
            is_hasBack: asset.is_hasBack,
          });
        }
      }

      if (imageInserts.length > 0) {
        const { error } = await supabase
          .from("image_products")
          .insert(imageInserts);

        if (error) {
          console.error("Error inserting product images:", error);
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error("Error uploading product images:", error);
      throw error;
    }
  }

  static async deleteProductTypeImages(imageIds: number[]): Promise<void> {
    if (!imageIds.length) return;

    // 1️⃣ Get file paths
    const { data: images, error: fetchError } = await supabase
      .from("image_products")
      .select("filepath")
      .in("id", imageIds);

    if (fetchError) throw fetchError;

    if (!images?.length) return;

    // 2️⃣ Extract relative paths properly
    const filePaths = images
      .map((img) => {
        const match = img.filepath.match(
          /\/storage\/v1\/object\/public\/product-images\/(.+)$/,
        );
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    console.log(filePaths);

    // 3️⃣ Delete from storage FIRST
    if (filePaths.length) {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove(filePaths);

      if (storageError) throw storageError;
    }

    // 4️⃣ Delete from database AFTER
    const { error: deleteError } = await supabase
      .from("image_products")
      .delete()
      .in("id", imageIds);

    if (deleteError) throw deleteError;
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
        // Filter by both type and brand through products relationship
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("id")
          .eq("product_type_id", typeId)
          .eq("brand_id", brandId)
          .single();

        if (productError || !productData) {
          return []; // No matching product combination
        }

        // Get sizes for this specific product combination using product_id
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
          .eq("product_id", productData.id);

        if (error) {
          throw error;
        }

        return data?.flatMap((item) => item.sizes).filter(Boolean) || [];
      } else if (typeId) {
        // Filter by type only - get all products that have this type
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("id")
          .eq("product_type_id", typeId);

        if (productError) {
          throw productError;
        }

        // If no products have this type, return empty
        if (!productData || productData.length === 0) {
          return [];
        }

        // Get sizes for all products that have this type
        const productIds = productData.map((item) => item.id);
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
          .in("product_id", productIds);

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
      ] = await Promise.allSettled([
        // Get customers count
        OrderService.getCustomersCount(),
        // Get orders count
        OrderService.getInvoicesCount(),
        // Get brands count
        this.getBrands().then((brands) => brands.length),
        // Get colors count
        this.getColors().then((colors) => colors.length),
        // Get product types count
        this.getProductTypes().then((types) => types.length),
        // Get product combinations count (instead of products)
        this.getProductCombinationsCount(),
      ]);

      // Extract values from settled promises
      const customersCount =
        customers.status === "fulfilled" ? customers.value : 0;
      const ordersCount =
        productOrders.status === "fulfilled" ? productOrders.value : 0;
      const brandsCount = brands.status === "fulfilled" ? brands.value : 0;
      const colorsCount = colors.status === "fulfilled" ? colors.value : 0;
      const typesCount =
        productTypes.status === "fulfilled" ? productTypes.value : 0;
      const sizesCount =
        productSizes.status === "fulfilled" ? productSizes.value : 0;

      return {
        success: true,
        data: {
          stats: {
            totalOrders: ordersCount,
            totalUsers: customersCount,
            activeProducts: sizesCount, // Using product combinations as active products
            totalBrands: brandsCount,
            totalColors: colorsCount,
            totalTypes: typesCount,
          },
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
          "id, size_id, product_id, sizes!inner(value), products(id, brands(name), product_type!inner(*))",
        );

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching product types:", error);
      return [];
    }
  }

  static async createSizeProduct(product_id: number, size_id: number) {
    try {
      // Validate product exists
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id")
        .eq("id", product_id)
        .single();

      if (productError || !product) {
        throw new Error("Product not found");
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
        .eq("product_id", product_id)
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
        .insert([{ product_id, size_id }])
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
    items: { product_id: number; size_id: number }[],
  ) {
    try {
      if (items.length === 0) return [];

      // Validate all product exist
      const productIds = [...new Set(items.map((item) => item.product_id))];
      const { data: existingProducts, error: productError } = await supabase
        .from("products")
        .select("id")
        .in("id", productIds);

      if (productError) throw productError;
      if (!existingProducts || existingProducts.length !== productIds.length) {
        throw new Error("One or more products not found");
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
        .select("product_id, size_id")
        .or(
          items
            .map(
              (item) =>
                `product_id.eq.${item.product_id},size_id.eq.${item.size_id}`,
            )
            .join(","),
        );

      if (existingError) throw existingError;

      const existingSet = new Set(
        (existing || []).map((item) => `${item.product_id}-${item.size_id}`),
      );

      const newItems = items.filter(
        (item) => !existingSet.has(`${item.product_id}-${item.size_id}`),
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

  static async getBrandTypes(): Promise<
    (BrandType & { brand_name?: string; product_type_name?: string })[]
  > {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id, 
          brand_id, 
          product_type_id,
          brands (
            name
          ),
          product_type!inner (
            name,
            is_hasBrand,
            is_hasColor
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
    let query: any;

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

      // Validate product type exists
      const { data: type, error: typeError } = await supabase
        .from("product_type")
        .select("id")
        .eq("id", type_id)
        .single();

      if (typeError || !type) {
        throw new Error("Product type not found");
      }
      // Check if brand and product type combination already exists
      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("brand_id", brand_id)
        .eq("product_type_id", type_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingProduct) {
        throw new Error(
          "Product with this brand_id and product_type_id already exists",
        );
      }

      // Check if the product has null brand_id that is equal to product_type_id
      const { data: hasNullBrandProduct, error: checkNullError } =
        await supabase
          .from("products")
          .select("id")
          .is("brand_id", null)
          .eq("product_type_id", type_id)
          .maybeSingle();

      if (checkNullError) {
        console.log(checkNullError);
        throw checkNullError;
      }
      // if it has, then update that existing null product else insert
      if (hasNullBrandProduct) {
        query = supabase
          .from("products")
          .update({ brand_id })
          .eq("id", hasNullBrandProduct.id);
      } else {
        query = supabase
          .from("products")
          .insert([{ brand_id, product_type_id: type_id }]);
      }

      const { data, error } = await query.select().single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create product");
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
        .from("product_type")
        .select("id")
        .eq("id", type_id)
        .single();

      if (typeError || !type) {
        throw new Error("Type not found");
      }
      // Check if brand and product type combination already exists
      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("brand_id", brand_id)
        .eq("product_type_id", type_id)
        .neq("id", id) // Exclude current record
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingProduct) {
        throw new Error(
          "Product with this brand_id and product_type_id already exists",
        );
      }

      const { data, error } = await supabase
        .from("products")
        .update({ brand_id, product_type_id: type_id })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to update product");
      }

      return data;
    } catch (error) {
      console.error("Error updating brand type:", error);
      throw error;
    }
  }

  static async deleteBrandType(id: number): Promise<void> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting product:", error);
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
          product_id, 
          color_id,
          products (
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
        .eq("products.product_type.is_hasBrand", false)
        .eq("products.product_type.is_hasColor", false)
        .overrideTypes<ColorBrandTypeWithDetails[]>();

      if (error) {
        throw error;
      }

      return (
        data?.map((item: ColorBrandTypeWithDetails) => ({
          ...item,
          brand_name: item.products.brands.name ?? "",
          color_name: item.colors?.value ?? "",
        })) ?? []
      );
    } catch (error) {
      console.error("Error fetching color brand types:", error);
      throw error;
    }
  }

  static async createColorBrandType(
    product_id: number,
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

      // Validate product exists
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id")
        .eq("id", product_id)
        .single();

      if (productError || !product) {
        throw new Error("Product not found");
      }
      // Check if product and color combination already exists
      const { data: existingColorProduct, error: checkError } = await supabase
        .from("color_products")
        .select("id")
        .eq("product_id", product_id)
        .eq("color_id", color_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingColorProduct) {
        throw new Error(
          "Color Product with this product_id and color_id already exists",
        );
      }

      const { data, error } = await supabase
        .from("color_products")
        .insert([{ product_id, color_id }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create color product");
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
    items: { product_id: number; color_id: number }[],
  ) {
    try {
      if (items.length === 0) return [];

      // Validate all products exist
      const productIds = [...new Set(items.map((item) => item.product_id))];
      const { data: existingProducts, error: productError } = await supabase
        .from("products")
        .select("id")
        .in("id", productIds);

      if (productError) throw productError;
      if (!existingProducts || existingProducts.length !== productIds.length) {
        throw new Error("One or more products not found");
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
        .select("product_id, color_id")
        .or(
          items
            .map(
              (item) =>
                `product_id.eq.${item.product_id},color_id.eq.${item.color_id}`,
            )
            .join(","),
        );

      if (existingError) throw existingError;

      const existingSet = new Set(
        (existing || []).map((item) => `${item.product_id}-${item.color_id}`),
      );

      const newItems = items.filter(
        (item) => !existingSet.has(`${item.product_id}-${item.color_id}`),
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
