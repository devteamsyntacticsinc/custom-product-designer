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
    id: string | number;
    created_at: string;
    products?: {
      id: string;
      brands?: {
        id: string;
        name: string;
      };
      product_type?: {
        id: string;
        name: string;
        is_onlyType: boolean;
        image_products?: {
          filepath: string;
          is_hasBack: boolean;
        }[];
      };
    }[];
    colors?: {
      id: string;
      value: string;
    }[];
    product_sizes?: Array<{
      id: string;
      size_id: string;
      quantity: number;
      sizes?: {
        id: string;
        value: string;
      };
    }>;
    product_images?: Array<{
      id: string;
      url: string;
      place: string;
    }>;
  }[];
  hasBrands: boolean;
}

export interface CustomerWithOrdersForDashboard {
  customer: {
    id: string;
    name: string;
    email: string;
    contact_number: string;
  } | null;
  orders: Array<{
    id: string;
    created_at: string;
    products?: {
      id: string;
      brands?: {
        id: string;
        name: string;
      };
      product_type?: {
        id: string;
        name: string;
        is_onlyType: boolean;
        image_products?: {
          filepath: string;
          is_hasBack: boolean;
        }[];
      };
    }[];
    colors?: {
      id: string;
      value: string;
    }[];
    product_sizes?: Array<{
      id: string;
      size_id: string;
      quantity: number;
      sizes?: {
        id: string;
        value: string;
      };
    }>;
    product_images?: Array<{
      id: string;
      url: string;
      place: string;
    }>;
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
