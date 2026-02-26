import { ProductService } from "@/lib/api/product";
import { NextResponse } from "next/server";

// /app/api/filters/route.ts
export async function GET() {
  const [productTypes, brands, sizes, colors] = await Promise.all([
    ProductService.getProductTypes(),
    ProductService.getBrands(),
    ProductService.getSizes(),
    ProductService.getColors(),
  ]);

  return NextResponse.json({
    product_type: productTypes.map((pt) => pt.name),
    brand: brands.map((b) => b.name),
    size: sizes.map((s) => s.value),
    color: colors.map((c) => c.value),
  });
}
