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

    // Parse request body to get document reference number
    const body = await req.json();
    const { document_reference_number } = body;

    // Validate document reference number
    if (
      !document_reference_number ||
      typeof document_reference_number !== "string"
    ) {
      return NextResponse.json(
        { error: "Document reference number is required" },
        { status: 400 },
      );
    }

    // Trim whitespace and validate
    const trimmedRef = document_reference_number.trim();
    if (trimmedRef.length === 0) {
      return NextResponse.json(
        { error: "Document reference number cannot be empty" },
        { status: 400 },
      );
    }

    if (trimmedRef.length > 50) {
      return NextResponse.json(
        { error: "Document reference number must be 50 characters or less" },
        { status: 400 },
      );
    }

    // Fetch order to verify it exists
    const order = await OrderService.getOrderById(id);

    if (!order || !order.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status to "claimed" with document reference number
    await OrderService.updateStatusToClaimedWithDocumentRef(
      order.id.toString(),
      trimmedRef,
    );

    return NextResponse.json(
      {
        message: "Order marked as claimed successfully",
        document_reference_number: trimmedRef,
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
