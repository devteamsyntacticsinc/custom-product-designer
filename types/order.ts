export interface OrderWithCustomer {
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
  invoice_logs?: Array<{
    id: number;
    status: string;
    created_at: string;
  }>;
  product_id: number;
  color_id: number;
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
  customer_id: string;
  customers: {
    id: string;
    name: string;
    email: string;
    contact_number: string;
  } | null;
  document_types: {
    id: number;
    ref_c2: string;
    description: string;
  } | null;
  invoice_no: string;
  document_reference_number: string | null;
  status: string;
  product_id: string;
  color_id: string | null;
}

export interface OrderWithInvoice {
  id: string;
  created_at: string;
  invoice_id: string;
  product_id: string;
  color_id: string;
  invoices: {
    id: string;
    customer_id: string;
    customers: {
      id: string;
      name: string;
      email: string;
      contact_number: string;
    } | null;
    document_types: {
      id: number;
      ref_c2: string;
      description: string;
    } | null;
    ref_no: string;
    status: string;
  } | null;
}

export interface OrderInDrawer {
  id: string;
  created_at: string;
  invoice_id: string;
  product_id: string;
  color_id: string;
  invoices: {
    id: string;
    customer_id: string;
    customers: {
      id: string;
      name: string;
      email: string;
      contact_number: string;
    };
    document_types: {
      id: number;
      ref_c2: string;
      description: string;
    };
    ref_no: string;
    status: string;
  } | null;
}
