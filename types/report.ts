export interface TopCustomers {
  id: string;
  created_at: string;
  products: {
    product_type: {
      id: string;
      name: string;
    } | null;
  } | null;
  invoices: {
    id: string;
    customer_id: string;
    customers: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
}
