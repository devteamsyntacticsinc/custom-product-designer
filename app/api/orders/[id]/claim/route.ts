import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/api/order";
import nodemailer from "nodemailer";
import { OrderWithCustomer } from "@/types/order";

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

    // Send claim email
    try {
      await sendClaimEmail(order, trimmedRef);
    } catch (emailError) {
      console.error("Failed to send claim email:", emailError);
      // We don't return error here because the order is already marked as claimed in DB
    }

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

async function sendClaimEmail(
  order: OrderWithCustomer,
  documentReferenceNumber: string,
) {
  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const customer = Array.isArray(order.customers)
    ? order.customers[0]
    : order.customers;
  const brandName = order.products?.[0]?.brands?.name || "";
  const productTypeName = order.products?.[0]?.product_type?.name || "Product";
  const productColor = order.colors?.[0]?.value || "";

  const sizeRows =
    order.product_sizes
      ?.map(
        (item) => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.sizes?.value || "Unknown"}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
        </tr>
    `,
      )
      .join("") || "";

  const totalItems =
    order.product_sizes?.reduce((total, item) => total + item.quantity, 0) || 0;

  if (customer?.email) {
    const customerMailOptions = {
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
      to: customer.email,
      subject: `Your Order #${order.document_types?.ref_c2}-${order.invoice_no} has been Claimed`,
      html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Order Claimed</title>
              </head>
              <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Order Successfully Claimed</h1>
                  
                  <p style="color: #666; font-size: 16px;">Hi ${customer?.name || "Valued Customer"}, thank you for choosing Print Pro! Your custom product order has been successfully claimed.</p>
                  
                  <div style="margin-bottom: 20px;">
                    <h2 style="color: #555; font-size: 18px;">Order & Transaction Information</h2>
                    <p><strong>Reference No.:</strong> ${order.document_types?.ref_c2}-${order.invoice_no}</p>
                    <p><strong>Document Reference No:</strong> <span style="color: #d9534f; font-weight: bold;">${documentReferenceNumber}</span></p>
                    <p><strong>Claim Date:</strong> ${new Date().toLocaleString()}</p>
                  </div>
   
                  <div style="margin-bottom: 20px;">
                    <h2 style="color: #555; font-size: 18px;">Product Details</h2>
                    <p><strong>Product Type:</strong> ${productTypeName}</p>
                    <p><strong>Brand:</strong> ${brandName}</p>
                    <p><strong>Color:</strong> ${productColor}</p>
                  </div>
   
                  <div style="margin-bottom: 20px;">
                    <h2 style="color: #555; font-size: 18px;">Size and Quantity Overview</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                      <thead>
                        <tr style="background-color: #f8f8f8;">
                          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Size</th>
                          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${sizeRows}
                      </tbody>
                    </table>
                    <p style="margin-top: 10px;"><strong>Total Items Delivered:</strong> ${totalItems}</p>
                  </div>
   
                  <div style="background: #fdf7f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5e7e7;">
                      <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.5;">
                          <strong>Thank you for your business!</strong><br>
                          We hope you love your custom items. Your feedback means the world to us — feel free to share your thoughts or tag us in your photos!<br><br>
                          Interested in more? Check out our latest collections at: <a href="${process.env.NEXTAUTH_URL}" style="color: #0077cc; text-decoration: none;">${process.env.NEXTAUTH_URL}</a>.
                      </p>
                  </div>
   
                  <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #2c3e50; font-size: 18px;">Need Assistance?</h3>
                      <p style="margin: 0;">If you have any questions regarding this transaction, please reach out:</p>
                      <p style="margin: 10px 0 0 0;">
                          <strong>Email:</strong> ${process.env.COMPANY_OWNER_EMAIL}
                      </p>
                  </div>
   
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                    <p>Best regards,<br>The Print Pro Team</p>
                  </div>
                </div>
              </body>
              </html>
          `,
    };
    await transporter.sendMail(customerMailOptions);
  }

  if (process.env.COMPANY_OWNER_EMAIL) {
    const ownerMailOptions = {
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
      to: process.env.COMPANY_OWNER_EMAIL,
      subject: `Order #${order.document_types?.ref_c2}-${order.invoice_no} has been Claimed`,
      html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Order Claimed Notification</title>
              </head>
              <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Order Claimed Notification</h1>
                  
                  <p style="color: #333; font-size: 16px;">This is an automated notification that a customer has claimed their order.</p>
                  
                  <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #555; font-size: 18px; margin-top: 0;">Transaction Summary</h2>
                    <p><strong>Customer Name:</strong> ${customer?.name || "N/A"}</p>
                    <p><strong>Customer Email:</strong> ${customer?.email || "N/A"}</p>
                    <p><strong>Reference No.:</strong> ${order.document_types?.ref_c2}-${order.invoice_no}</p>
                    <p><strong>Document Ref No:</strong> <span style="color: #d9534f; font-bold: true;">${documentReferenceNumber}</span></p>
                    <p><strong>Date Processed:</strong> ${new Date().toLocaleString()}</p>
                  </div>
   
                  <div style="margin-bottom: 20px;">
                    <h2 style="color: #555; font-size: 18px;">Product & Size Details</h2>
                    <p><strong>Type:</strong> ${productTypeName} | <strong>Color:</strong> ${productColor}</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                      <thead>
                        <tr style="background-color: #f8f8f8;">
                          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Size</th>
                          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${sizeRows}
                      </tbody>
                    </table>
                  </div>
   
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; text-align: center;">
                    <p>This is a system-generated report from Print Pro Designer.</p>
                  </div>
                </div>
              </body>
              </html>
          `,
    };
    await transporter.sendMail(ownerMailOptions);
  }
}
