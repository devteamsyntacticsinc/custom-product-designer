import { NextResponse } from "next/server";
import { ProductService } from "@/lib/api/product";

interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

export async function GET() {
  try {
    const productTypes = await ProductService.getProductTypes();
    return NextResponse.json(productTypes);
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
    const contentType = request.headers.get("content-type") || "";

    let name: string;
    let is_Active: boolean;
    let is_onlyType: boolean;
    let images: { file: File; is_hasBack: boolean }[] = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with images
      const formData = await request.formData();

      name = formData.get("name") as string;
      is_Active = formData.get("is_Active") === "true";
      is_onlyType = formData.get("is_onlyType") === "true";

      // Extract images from FormData
      const imageKeys = Array.from(formData.keys()).filter((key) =>
        key.startsWith("images["),
      );

      for (const key of imageKeys) {
        if (key.includes(".file")) {
          const file = formData.get(key) as File;
          if (file) {
            const indexMatch = key.match(/images\[(\d+)\]/);
            if (indexMatch) {
              const index = indexMatch[1];
              const is_hasBack =
                formData.get(`images[${index}].is_hasBack`) === "true";
              images.push({ file, is_hasBack });
            }
          }
        }
      }
    } else {
      // Handle regular JSON (backward compatibility)
      const body = await request.json();
      name = body.name;
      is_Active = body.is_Active;
      is_onlyType = body.is_onlyType;
      images = body.images || [];
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 },
      );
    }

    if (images.length > 2) {
      return NextResponse.json(
        { error: "Maximum of 2 images allowed" },
        { status: 400 },
      );
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        {
          error: "Product type name is required and must be a non-empty string",
        },
        { status: 400 },
      );
    }

    const productType = await ProductService.createProductType(
      name.trim(),
      is_Active !== undefined ? is_Active : true,
      is_onlyType !== undefined ? is_onlyType : false,
      images,
    );
    return NextResponse.json(productType, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof Error &&
      error.message === "Product type with this name already exists"
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
    const contentType = request.headers.get("content-type") || "";

    let id: string;
    let name: string | undefined;
    let is_Active: boolean | undefined;
    let is_onlyType: boolean | undefined;
    let images: { file: File; is_hasBack: boolean }[] = [];
    let imagesToDelete: number[] = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with images
      const formData = await request.formData();

      id = formData.get("id") as string;
      name = formData.get("name") as string;
      is_Active = formData.get("is_Active") === "true";
      is_onlyType = formData.get("is_onlyType") === "true";

      // Extract images from FormData
      const imageKeys = Array.from(formData.keys()).filter((key) =>
        key.startsWith("images["),
      );

      for (const key of imageKeys) {
        if (key.includes(".file")) {
          const file = formData.get(key) as File;
          if (file) {
            const indexMatch = key.match(/images\[(\d+)\]/);
            if (indexMatch) {
              const index = indexMatch[1];
              const is_hasBack =
                formData.get(`images[${index}].is_hasBack`) === "true";
              images.push({ file, is_hasBack });
            }
          }
        }
      }

      // Extract images to delete
      const deleteKeys = Array.from(formData.keys()).filter((key) =>
        key.startsWith("imagesToDelete["),
      );

      for (const key of deleteKeys) {
        const imageId = formData.get(key);
        if (imageId) {
          imagesToDelete.push(parseInt(imageId.toString(), 10));
        }
      }
    } else {
      // Handle regular JSON (backward compatibility)
      const body = await request.json();
      id = body.id;
      name = body.name;
      is_Active = body.is_Active;
      is_onlyType = body.is_onlyType;
      images = body.images || [];
      imagesToDelete = body.imagesToDelete || [];
    }

    // Validate images only if they are provided (optional for updates)
    if (images.length > 0) {
      if (images.length > 2) {
        return NextResponse.json(
          { error: "Maximum of 2 images allowed" },
          { status: 400 },
        );
      }
    }

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Product type ID is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (
      !name &&
      is_Active === undefined &&
      is_onlyType === undefined &&
      images.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one field (name, is_Active, is_onlyType, or images) must be provided for update",
        },
        { status: 400 },
      );
    }

    const productType = await ProductService.updateProductType(
      id.trim(),
      name ? name.trim() : undefined,
      is_Active,
      is_onlyType,
      images,
      imagesToDelete,
    );
    return NextResponse.json(productType);
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error && error.message === "Product type not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error instanceof Error &&
      error.message === "Product type with this name already exists"
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
  let imagesToDelete: number[] = [];

  try {
    const contentType = request.headers.get("content-type") || "";
    let id: string;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with images to delete
      const formData = await request.formData();
      id = formData.get("id") as string;

      // Extract images to delete
      const deleteKeys = Array.from(formData.keys()).filter((key) =>
        key.startsWith("imagesToDelete["),
      );

      for (const key of deleteKeys) {
        const imageId = formData.get(key);
        if (imageId) {
          imagesToDelete.push(parseInt(imageId.toString(), 10));
        }
      }
    } else {
      // Handle query parameters (backward compatibility)
      const { searchParams } = new URL(request.url);
      id = searchParams.get("id") || "";

      // Also check if there's a JSON body with imagesToDelete
      try {
        const body = await request.json().catch(() => ({}));
        imagesToDelete = body.imagesToDelete || [];
      } catch {
        // Ignore JSON parsing errors for backward compatibility
      }
    }

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Product type ID is required" },
        { status: 400 },
      );
    }

    await ProductService.deleteProductType(id.trim(), imagesToDelete);
    return NextResponse.json({ message: "Product type deleted successfully" });
  } catch (error) {
    console.error("API Error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === "Product type not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    // Handle foreign key constraint violation
    if (error && typeof error === "object" && error !== null) {
      const errorObj = error as DatabaseError;

      if (
        errorObj.message &&
        (errorObj.message.includes("violates foreign key constraint") ||
          errorObj.code === "23503")
      ) {
        return NextResponse.json(
          { error: "Cannot delete product type that is being used by brands" },
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
