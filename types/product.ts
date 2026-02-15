export interface Product {
  id: string
  product_name: string
  image: string
  brand_id?: string
  brand?: {
    id: string
    name: string
  } | null
  color_id?: string
  color?: {
    id: string
    value: string
  } | null
  product_type_id?: string
  product_type?: {
    id: string
    name: string
  } | null
}

export interface Brand {
  id: string
  name: string
  type_id?: string
}

export interface Color {
  id: string
  value: string
}

export interface ProductType {
  id: string
  name: string
}

export interface Size {
  id: string
  value: string
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

