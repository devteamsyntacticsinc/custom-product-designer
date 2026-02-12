export interface Product {
  id: string
  product_name: string
  image: string
  category_id: string
  product_category?: {
    id: string
    name: string
  } | null
}
