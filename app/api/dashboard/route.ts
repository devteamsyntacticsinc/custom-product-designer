import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/api/product'

export async function GET() {
  try {
    const result = await ProductService.getDashboardStats()
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch dashboard data' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}