import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/api/order";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    console.log(rawId);
    const id = Number(rawId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Fetch order to verify it exists
    const order = await OrderService.getOrderById(id);

    if (!order || !order.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status to "claimed"
    await OrderService.updateStatusToClaimed(order.id.toString());

    return NextResponse.json(
      {
        message: "Order marked as claimed successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error marking order as claimed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark order as claimed" },
      { status: 500 },
    );
  }
}
