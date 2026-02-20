import { NextResponse } from "next/server";
import { ProductService } from "@/lib/api/product";

interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

export async function GET() {
  try {
    const sizes = await ProductService.getSizeProduct();
    return NextResponse.json(sizes);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required and must be non-empty" },
        { status: 400 },
      );
    }

    // Validate each item structure
    for (const item of items) {
      if (!item.brandT_id || typeof item.brandT_id !== "number") {
        return NextResponse.json(
          { error: "Each item must have a valid Brand Type" },
          { status: 400 },
        );
      }
      if (!item.size_id || typeof item.size_id !== "number") {
        return NextResponse.json(
          { error: "Each item must have a valid Size" },
          { status: 400 },
        );
      }
    }

    const createdProducts = await ProductService.batchCreateSizeProducts(items);
    return NextResponse.json(createdProducts, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof Error &&
      error.message === "One or more brand types not found"
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error instanceof Error &&
      error.message === "One or more sizes not found"
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error instanceof Error &&
      error.message === "Size product combination already exists"
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs array is required and must be non-empty" },
        { status: 400 },
      );
    }

    // Validate each ID
    for (const id of ids) {
      if (!id || typeof id !== "number") {
        return NextResponse.json(
          { error: "Each ID must be a valid number" },
          { status: 400 },
        );
      }
    }

    const result = await ProductService.batchDeleteSizeProducts(ids);
    return NextResponse.json({
      message: "Size products deleted successfully",
      deleted: result.deleted,
    });
  } catch (error) {
    console.error("API Error:", error);

    // Handle foreign key constraint violation
    if (error && typeof error === "object" && error !== null) {
      const errorObj = error as DatabaseError;

      if (
        errorObj.message &&
        (errorObj.message.includes("violates foreign key constraint") ||
          errorObj.code === "23503")
      ) {
        return NextResponse.json(
          {
            error: "Cannot delete size products that are being used by orders",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
