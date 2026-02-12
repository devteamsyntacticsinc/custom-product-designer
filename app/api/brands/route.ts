import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/api/product'

export async function GET() {
  try {
    const brands = await ProductService.getBrands()
    return NextResponse.json(brands)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
