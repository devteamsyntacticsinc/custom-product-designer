import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/api/product'

interface DatabaseError extends Error {
  code?: string
  details?: string
  hint?: string
}

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, is_Active } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Brand name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const brand = await ProductService.createBrand(
      name.trim(), 
      is_Active !== undefined ? is_Active : true
    )
    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof Error && error.message === 'Brand with this name already exists') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, is_Active } = body

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: 'Brand ID is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!name && is_Active === undefined) {
      return NextResponse.json(
        { error: 'At least one field (name or is_Active) must be provided for update' },
        { status: 400 }
      )
    }

    const brand = await ProductService.updateBrand(
      id.trim(), 
      name ? name.trim() : undefined,
      is_Active
    )
    return NextResponse.json(brand)
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof Error && error.message === 'Brand not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    if (error instanceof Error && error.message === 'Brand with this name already exists') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: 'Brand ID is required as a query parameter' },
        { status: 400 }
      )
    }

    await ProductService.deleteBrand(id.trim())
    return NextResponse.json({ message: 'Brand deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    
    // Handle foreign key constraint violation
    if (error && typeof error === 'object' && error !== null) {
      const errorObj = error as DatabaseError
      
      if (errorObj.message && 
          (errorObj.message.includes('violates foreign key constraint') || 
           errorObj.code === '23503')) {
        return NextResponse.json(
          { error: 'Cannot delete brand that is being used by product types' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
