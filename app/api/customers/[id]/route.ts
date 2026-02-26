import { NextRequest, NextResponse } from "next/server";
import { CustomerService } from "@/lib/api/customer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log(id);

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 },
      );
    }

    const orders = await CustomerService.getCustomerOrders(id);

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer orders",
      },
      { status: 500 },
    );
  }
}
