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
    product_type: productTypes.map((pt) => ({ id: pt.id, name: pt.name })),
    brand: brands.map((b) => ({ id: b.id, name: b.name })),
    size: sizes.map((s) => ({ id: s.id, value: s.value })),
    color: colors.map((c) => ({ id: c.id, value: c.value })),
  });
}
