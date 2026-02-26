import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/api/order";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID is required" },
      { status: 400 },
    );
  }
  let orders;

  try {
    let type: "user" | "order" | "product" = "user";
    let cleanedId = 0;
    // 1. If it contains user, set user
    if (id.includes("user")) {
      type = "user";
      cleanedId = parseInt(id.replace("user-", ""));
    }
    if (id.includes("order")) {
      type = "order";
      cleanedId = parseInt(id.replace("order-", ""));
    }
    if (id.includes("product")) {
      type = "product";
      cleanedId = parseInt(id.replace("product-", ""));
    }
    if (type === "user") {
      orders = await OrderService.getOrdersByCustomerId(cleanedId);
    } else if (type === "order") {
      orders = await OrderService.getOrderById(cleanedId);
    } else if (type === "product") {
      return NextResponse.json(
        { success: false, error: "Product orders not implemented yet" },
        { status: 501 },
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
