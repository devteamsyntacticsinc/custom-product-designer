import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/api/product'
import { OrderService } from '@/lib/api/order'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [statsResult, activityResult] = await Promise.all([
      ProductService.getDashboardStats(),
      OrderService.getRecentActivity(page, limit)
    ])
    
    if (statsResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          stats: statsResult.data,
          recentActivity: activityResult
        }
      })
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