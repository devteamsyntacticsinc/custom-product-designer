import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/api/order';

export async function GET() {
  try {
    const orders = await OrderService.getAllOrders();
    
    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
