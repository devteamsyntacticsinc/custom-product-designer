import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/api/product'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const typeId = searchParams.get('typeId')
    const brandId = searchParams.get('brandId')

    const sizes = await ProductService.getSizesByProductType(typeId || undefined, brandId || undefined)
    return NextResponse.json(sizes)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
