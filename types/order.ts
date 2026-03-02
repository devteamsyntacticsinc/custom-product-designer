export interface OrderWithCustomer {
  id: string;
  created_at: string;
  customers:
    | {
        id: string;
        name: string;
        email: string;
        contact_number: string;
      }
    | {
        id: string;
        name: string;
        email: string;
        contact_number: string;
      }[]
    | null;
  brand_type?: {
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
}

export interface CustomerActivity {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  type: "order" | "user" | "product";
  title: string;
  description: string;
  timestamp: string;
}

export interface RecentActivity {
  id: string;
  created_at: string;
  invoices: {
    id: string;
    customer_id: string;
    customers: {
      id: string;
      name: string;
      email: string;
      contact_number: string;
    } | null;
    ref_no: string;
    status: string;
  } | null;
}
