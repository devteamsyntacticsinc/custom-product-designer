export interface OrderWithCustomer {
  id: string;
  created_at: string;
  customers: {
    id: string;
    name: string;
    email: string;
  } | {
    id: string;
    name: string;
    email: string;
  }[] | null;
}

export interface CustomerActivity {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'product';
  title: string;
  description: string;
  timestamp: string;
}