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
    document_types: {
      id: number;
      ref_c2: string;
      description: string;
    };
    ref_no: string;
    status: string;
  } | null;
}

export interface OrderWithInvoice {
  id: string;
  created_at: string;
  invoice_id: string;
  brandT_id: string;
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
    document_types:{
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
  brandT_id: string;
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
