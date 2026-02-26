import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/api/product'
import { OrderService } from '@/lib/api/order'
import { ReportService } from '@/lib/api/report'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const ptfrom = searchParams.get('ptfrom') ?? undefined
    const ptto = searchParams.get('ptto') ?? undefined
    const productType = searchParams.get('productType') ?? undefined
    const obfrom = searchParams.get('obfrom') ?? undefined
    const obto = searchParams.get('obto') ?? undefined


    const [statsResult, activityResult, topCustomersResult, ordersByProductTypeTimeSeriesResult, mostOrderedBrandResult] = await Promise.allSettled([
      ProductService.getDashboardStats(),
      OrderService.getRecentActivity(page, limit),
      ReportService.getTopCustomers(ptfrom, ptto, productType),
      ReportService.getOrdersByProductTypeTimeSeries(ptfrom, ptto),
      ReportService.getMostOrderedBrand(obfrom, obto),
    ])

    // Handle both results separately
    const stats = statsResult.status === 'fulfilled' ? statsResult.value : { success: false, data: null }
    const activity = activityResult.status === 'fulfilled' ? activityResult.value : { activities: [], total: 0, totalPages: 0, currentPage: page }
    const topCustomers = topCustomersResult.status === 'fulfilled' ? topCustomersResult.value : []
    const ordersByProductTypeTimeSeries = ordersByProductTypeTimeSeriesResult.status === 'fulfilled' ? ordersByProductTypeTimeSeriesResult.value : { data: [], types: [] }
    const mostOrderedBrand = mostOrderedBrandResult.status === 'fulfilled' ? mostOrderedBrandResult.value : []

    // Always return success with available data
    return NextResponse.json({
      success: true,
      data: {
        stats: stats.success && stats.data ? stats.data.stats : {
          totalOrders: 0,
          totalUsers: 0,
          activeProducts: 0,
          totalBrands: 0,
          totalColors: 0,
          totalTypes: 0,
        },
        recentActivity: activity,
        topCustomers,
        ordersByProductTypeTimeSeries,
        mostOrderedBrand
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    // Return fallback data even on API errors
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders: 0,
          totalUsers: 0,
          activeProducts: 0,
          totalBrands: 0,
          totalColors: 0,
          totalTypes: 0,
        },
        recentActivity: {
          activities: [],
          total: 0,
          totalPages: 0,
          currentPage: 1
        },
        topCustomers: [],
        ordersByProductTypeTimeSeries: { data: [], types: [] },
        mostOrderedBrand: []
      }
    })
  }
}