import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/lib/api/customer';

export async function GET(request: NextRequest) {
    try {
        const customers = await CustomerService.getCustomers();
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            { error: "Failed to fetch customers" },
            { status: 500 }
        );
    }
}