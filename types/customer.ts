export interface Customer {
  id: string;
  name: string;
  email: string;
  contact_number: string;
}

export interface CustomerWithOrders {
  id: string;
  name: string;
  email: string;
  contact_number: string;
  orders: {
    id: number;
    created_at: string;
    products?: {
      id: number;
      brands?: {
        id: number;
        name: string;
      };
      product_type?: {
        id: number;
        name: string;
        is_onlyType: boolean;
        image_products?: {
          filepath: string;
          is_hasBack: boolean;
        }[];
      };
    }[];
    colors?: {
      id: number;
      value: string;
    }[];
    product_sizes?: Array<{
      id: number;
      invoice_id: number;
      size_id: number;
      quantity: number;
      sizes?: {
        id: number;
        value: string;
      };
    }>;
    product_images?: Array<{
      id: number;
      invoice_id: number;
      url: string;
      place: string;
    }>;
    invoice_no: string;
    document_reference_number: string | null;
    document_types?: {
      id: number;
      ref_c2: string;
      description: string;
    } | null;
    status: string;
    product_id: number;
    color_id: number;
    invoice_logs?: Array<{
      id: number;
      status: string;
      created_at: string;
    }>;
  }[];
  hasBrands: boolean;
}

export interface CustomerWithOrdersForDashboard {
  customer: {
    id: number;
    name: string;
    email: string;
    contact_number: number;
  } | null;
  orders: Array<{
    id: number;
    created_at: string;
    customers:
    | {
      id: number;
      name: string;
      email: string;
      contact_number: number;
    }
    | {
      id: number;
      name: string;
      email: string;
      contact_number: number;
    }[]
    | null;
    products?: Array<{
      id: number;
      brands?: {
        id: number;
        name: string;
      };
      product_type?: {
        id: number;
        name: string;
        is_onlyType: boolean;
        image_products?: {
          filepath: string;
          is_hasBack: boolean;
        }[];
      };
    }>;
    colors: {
      id: number;
      value: string;
    }[];
    product_sizes: Array<{
      id: number;
      invoice_id: number;
      size_id: number;
      quantity: number;
      sizes?: {
        id: number;
        value: string;
      };
    }>;
    product_images: Array<{
      id: number;
      invoice_id: number;
      url: string;
      place: string;
    }>;
    invoice_no: string;
    document_reference_number: string | null;
    document_types?: {
      id: number;
      ref_c2: string;
      description: string;
    } | null;
    status: string;
    product_id: number;
    color_id: number;
  }>;
}

export interface FilteredOrder {
  customer_id: string;
  products: {
    id: string;
    brands: {
      id: string;
      name: string;
    } | null;
    product_type: {
      id: string;
      name: string;
    };
  };
  product_sizes?: Array<{
    productO_id: string;
    sizes: {
      id: string;
      value: string;
    };
  }>;
  colors?: Array<{
    id: string;
    value: string;
  }>;
}