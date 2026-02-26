import { NextRequest, NextResponse } from "next/server";
import { CustomerService } from "@/lib/api/customer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const filters = {
      product_type: searchParams.get("product_type") || undefined,
      brand: searchParams.get("brand") || undefined,
      size: searchParams.get("size") || undefined,
      color: searchParams.get("color") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
    };

    // Remove undefined filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined),
    );

    const customers = await CustomerService.getCustomers(
      Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
    );

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}
