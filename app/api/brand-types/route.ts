import { NextResponse } from "next/server";
import { ProductService } from "@/lib/api/product";

interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

export async function GET() {
  try {
    const brandTypes = await ProductService.getBrandTypes();
    return NextResponse.json(brandTypes);
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
    const { brand_id, product_type_id } = body;

    if (!brand_id || typeof brand_id !== "number") {
      return NextResponse.json(
        { error: "Brand ID is required and must be a number" },
        { status: 400 },
      );
    }

    if (!product_type_id || typeof product_type_id !== "number") {
      return NextResponse.json(
        { error: "Product Type ID is required and must be a number" },
        { status: 400 },
      );
    }

    const createdProducts = await ProductService.createBrandType(
      brand_id,
      product_type_id,
    );
    return NextResponse.json(createdProducts, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof Error &&
      error.message ===
        "Product with this brand and product type already exists"
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, brand_id, product_type_id } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "ID is required and must be a number" },
        { status: 400 },
      );
    }

    if (!brand_id || typeof brand_id !== "number") {
      return NextResponse.json(
        { error: "Brand ID is required and must be a number" },
        { status: 400 },
      );
    }

    if (!product_type_id || typeof product_type_id !== "number") {
      return NextResponse.json(
        { error: "Product Type ID is required and must be a number" },
        { status: 400 },
      );
    }

    const updatedProduct = await ProductService.updateBrandType(
      id,
      brand_id,
      product_type_id,
    );
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof Error &&
      error.message ===
        "Product with this brand_id and product_type_id already exists"
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "ID is required as a valid number query parameter" },
        { status: 400 },
      );
    }

    await ProductService.deleteBrandType(parseInt(id));
    return NextResponse.json({ message: "Product deleted successfully" });
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
          { error: "Cannot delete product that is being used by color products" },
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
