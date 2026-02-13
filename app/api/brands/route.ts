import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/api/product'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const typeId = searchParams.get('typeId')

    const brands = await ProductService.getBrands(typeId || undefined)
    return NextResponse.json(brands)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
