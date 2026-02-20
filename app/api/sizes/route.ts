import { NextResponse } from "next/server";
import { ProductService } from "@/lib/api/product";

interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

export async function GET() {
  try {
    const sizes = await ProductService.getSizes();
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
    const { value, is_Active } = body;

    if (!value || typeof value !== "string" || value.trim() === "") {
      return NextResponse.json(
        { error: "Size value is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const size = await ProductService.createSize(
      value.trim(),
      is_Active !== undefined ? is_Active : true,
    );
    return NextResponse.json(size, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof Error &&
      error.message === "Size with this value already exists"
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
    const { id, value, is_Active } = body;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Size ID is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (!value && is_Active === undefined) {
      return NextResponse.json(
        {
          error:
            "At least one field (value or is_Active) must be provided for update",
        },
        { status: 400 },
      );
    }

    const size = await ProductService.updateSize(
      id.trim(),
      value ? value.trim() : undefined,
      is_Active,
    );
    return NextResponse.json(size);
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error && error.message === "Size not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error instanceof Error &&
      error.message === "Size with this value already exists"
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

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Size ID is required as a query parameter" },
        { status: 400 },
      );
    }

    await ProductService.deleteSize(id.trim());
    return NextResponse.json({ message: "Size deleted successfully" });
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
          { error: "Cannot delete size that is being used by product orders" },
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
