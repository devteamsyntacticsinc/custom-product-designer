import { NextResponse } from "next/server";
import { ProductService } from "@/lib/api/product";

interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

export async function GET() {
  try {
    const brandTypes = await ProductService.getColorBrandTypes();
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

    // Check if this is a batch operation
    if (body.items && Array.isArray(body.items)) {
      const { items } = body;

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: "Items array is required and must not be empty" },
          { status: 400 },
        );
      }

      // Validate each item
      for (const item of items) {
        if (!item.product_id || typeof item.product_id !== "number") {
          return NextResponse.json(
            { error: "Each item must have a valid product_id (number)" },
            { status: 400 },
          );
        }

        if (!item.color_id || typeof item.color_id !== "number") {
          return NextResponse.json(
            { error: "Each item must have a valid color_id (number)" },
            { status: 400 },
          );
        }
      }

      const createdColorProducts =
        await ProductService.batchCreateColorProducts(items);
      return NextResponse.json(createdColorProducts, { status: 201 });
    } else {
      // Single item creation (legacy support)
      const { product_id, color_id } = body;

      if (!product_id || typeof product_id !== "number") {
        return NextResponse.json(
          { error: "Product ID is required and must be a number" },
          { status: 400 },
        );
      }

      if (!color_id || typeof color_id !== "number") {
        return NextResponse.json(
          { error: "Color ID is required and must be a number" },
          { status: 400 },
        );
      }

      const createdColorProduct = await ProductService.createColorBrandType(
        product_id,
        color_id,
      );
      return NextResponse.json(createdColorProduct, { status: 201 });
    }
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof Error &&
      error.message ===
        "Color product with this product_id and color_id already exists"
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
    const { id, product_id, color_id } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "ID is required and must be a number" },
        { status: 400 },
      );
    }

    if (!product_id || typeof product_id !== "number") {
      return NextResponse.json(
        { error: "Product ID is required and must be a number" },
        { status: 400 },
      );
    }

    if (!color_id || typeof color_id !== "number") {
      return NextResponse.json(
        { error: "Color ID is required and must be a number" },
        { status: 400 },
      );
    }

    const updatedColorProduct = await ProductService.updateColorBrandType(
      id,
      product_id,
      color_id,
    );
    return NextResponse.json(updatedColorProduct);
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof Error &&
      error.message ===
        "Color product with this product_id and color_id already exists"
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

    // Check if this is a batch operation
    if (body.ids && Array.isArray(body.ids)) {
      const { ids } = body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "IDs array is required and must not be empty" },
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

      const result = await ProductService.batchDeleteColorProducts(ids);
      return NextResponse.json({
        message: "Color products deleted successfully",
        deleted: result.deleted,
      });
    } else {
      // Single item deletion (legacy support)
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: "ID is required as a valid number query parameter" },
          { status: 400 },
        );
      }

      await ProductService.deleteColorBrandType(parseInt(id));
      return NextResponse.json({
        message: "Color product deleted successfully",
      });
    }
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
          { error: "Cannot delete color product that is being used by products" },
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
