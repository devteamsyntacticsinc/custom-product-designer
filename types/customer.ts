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
    brand_type?: {
      id: string;
      brands?: {
        id: string;
        name: string;
      };
      product_type?: {
        id: string;
        name: string;
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
}

export interface CustomerWithOrdersForDashboard {
  customer: {
    id: string;
    name: string;
    email: string;
    contact_number: string;
  };
  orders: Array<{
    id: string;
    created_at: string;
    brand_type?: {
      id: string;
      brands?: {
        id: string;
        name: string;
      };
      product_type?: {
        id: string;
        name: string;
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