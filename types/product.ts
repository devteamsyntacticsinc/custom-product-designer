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
}

export interface Color {
  id: string
  value: string
}

export interface ProductType {
  id: string
  name: string
}
