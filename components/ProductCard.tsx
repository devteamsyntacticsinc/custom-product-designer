import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image || "/placeholder-product.svg"}
          alt={product.product_name}
          width={400}
          height={400}
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder-product.svg"
          }}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.product_name}
        </h3>
      </CardContent>
    </Card>
  )
}
