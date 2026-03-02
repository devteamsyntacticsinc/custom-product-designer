import { NextResponse } from "next/server";
import { ProductService } from "@/lib/api/product";

interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get("typeId");

    const brands = await ProductService.getBrands(
      typeId ? Number(typeId) : undefined,
    );
    return NextResponse.json(brands);
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
    const { name, is_Active, product_type_ids, product_type_id } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Brand name is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    let result;
    if (product_type_ids && Array.isArray(product_type_ids)) {
      // Create brand with multiple product types
      if (product_type_ids.length === 0) {
        return NextResponse.json(
          { error: "At least one product type must be selected" },
          { status: 400 },
        );
      }
      result = await ProductService.createBrandWithMultipleTypes(
        name.trim(),
        product_type_ids,
        is_Active !== undefined ? is_Active : true,
      );
    } else if (product_type_id !== undefined) {
      // Create brand with single product type (backward compatibility)
      result = await ProductService.createBrandWithType(
        name.trim(),
        product_type_id,
        is_Active !== undefined ? is_Active : true,
      );
    } else {
      // Create brand without product type
      result = await ProductService.createBrand(
        name.trim(),
        is_Active !== undefined ? is_Active : true,
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof Error &&
      error.message === "Brand with this name already exists"
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
    const { id, name, is_Active, product_type_ids } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "Brand ID is required and must be a number" },
        { status: 400 },
      );
    }

    if (!name && !product_type_ids) {
      return NextResponse.json(
        { error: "At least name or product_type_ids must be provided for update" },
        { status: 400 },
      );
    }

    // Update brand with multiple product types
    const result = await ProductService.updateBrandWithTypes(
      id,
      product_type_ids,
      name,
      is_Active,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error && error.message === "Brand not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error instanceof Error &&
      error.message === "Brand with this name already exists"
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
        { error: "Brand ID is required as a valid number query parameter" },
        { status: 400 },
      );
    }

    await ProductService.deleteBrand(parseInt(id));
    return NextResponse.json({ message: "Brand deleted successfully" });
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
          { error: "Cannot delete brand that is being used by products" },
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
