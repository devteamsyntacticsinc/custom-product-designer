export interface Product {
  id: string;
  product_name: string;
  image: string;
  brand_id?: string;
  brand?: {
    id: string;
    name: string;
  } | null;
  color_id?: string;
  color?: {
    id: string;
    value: string;
  } | null;
  product_type_id?: string;
  product_type?: {
    id: string;
    name: string;
    is_onlyType?: boolean;
  } | null;
  is_onlyType?: boolean;
}

export interface Brand {
  id: number;
  name: string;
  is_Active?: boolean;
  type_id?: number;
}

export interface Color {
  id: number;
  value: string;
  is_Active: boolean;
}

export interface ProductType {
  id: number;
  name: string;
  is_Active?: boolean;
  is_onlyType?: boolean;
  image_products?: ImageProducts[];
}

export interface ImageProducts {
  id: number;
  producT_id: number;
  filepath: string;
  is_hasBack: boolean;
}

export interface Size {
  id: number;
  value: string;
  is_Active: boolean;
}

export interface OrderData {
  // IDs for database operations
  productTypeId: string;
  brandId: string;
  colorId: string;
  // Display names for email
  productType: string;
  brand: string;
  color: string;
  sizeSelection: { size: string; quantity: number }[];
  assets: Record<string, File | null>;
  contactInformation: {
    fullName: string;
    email: string;
    contactNumber: string;
    address: string;
  };
}

export interface OrderResult {
  customerData: {
    id: string;
    name: string;
    email: string;
    contact_number: string;
    address: string;
  };
  productOrderData: {
    id: string;
    customer_id: string;
    brandT_id: string;
    color_id: string;
  };
}

export interface SizingAndQuantityProps {
  sizeSelection: {
    size: number;
    quantity: number;
  }[];
  setSizeSelection: (
    value: {
      size: number;
      quantity: number;
    }[],
  ) => void;
  productTypeId: string;
  brandId: string;
}

export interface SizeProduct {
  id: number;
  sizes: { value: string };
  brandT_id: number;
  size_id: number;
  brand_type: {
    id: number;
    brands: { name: string };
    product_type: { name: string };
  };
}

export interface BrandGroup {
  brandTypeId: number;
  brandName: string;
  sizes: Set<string>;
  brandTypeRef: SizeProduct["brand_type"];
  sizeId: number;
}

export interface BrandType {
  id: number;
  brand_id: number;
  type_id: number;
  brand_name?: string;
  product_type_name?: string;
}

export interface BrandTypeWithDetails {
  id: number;
  brand_id: number;
  type_id: number;
  brands: {
    name: string;
  };
  product_type: {
    name: string;
    is_onlyType: boolean;
  };
}

export interface ColorBrandTypeWithDetails {
  id: number;
  brandT_id: number;
  color_id: number;
  brand_type: {
    brand_id: number;
    brands: {
      name: string;
    };
    product_type: {
      name: string;
    };
  };
  colors: {
    value: string;
  };
}

export interface ColorProduct {
  id: number;
  colors: { value: string };
  brandT_id: number;
  color_id: number;
  brand_type: {
    id: number;
    brands: { name: string };
    product_type: { name: string };
  };
}

export interface BrandGroup {
  brandTypeId: number;
  brandName: string;
  sizes: Set<string>;
  brandTypeRef: SizeProduct["brand_type"];
  sizeId: number;
}

export interface ColorBrandGroup {
  brandTypeId: number;
  brandName: string;
  colors: Set<string>;
  brandTypeRef: ColorProduct["brand_type"];
  colorId: number;
}
