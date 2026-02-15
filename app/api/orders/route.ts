import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/api/order';
import { OrderData } from '@/types/product';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Parse the order data from JSON string
    const orderDataJson = formData.get('orderData') as string;
    const orderData: OrderData = JSON.parse(orderDataJson);
    
    // Extract files from FormData
    const assets: Record<string, File | null> = {};
    const assetKeys = ['front-top-left', 'front-center', 'back-top', 'back-bottom'];
    
    assetKeys.forEach(key => {
      const file = formData.get(key) as File;
      assets[key] = file && file.size > 0 ? file : null;
    });

    // Update orderData with the extracted files
    orderData.assets = assets;

    // Process order using OrderService
    const { customerData, productOrderData } = await OrderService.processOrder(orderData);

    // Send email notification to company owner
    await sendOrderEmail(orderData, customerData.id);

    return NextResponse.json({ 
      success: true, 
      orderId: productOrderData.id,
      customerId: customerData.id 
    });

  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendOrderEmail(orderData: OrderData, customerId: string) {
  try {
    // Create transporter with SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generate email HTML content
    const emailHTML = generateOrderEmailHTML(orderData, customerId);

    // Send email
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.COMPANY_OWNER_EMAIL,
      subject: `New Order Received - ${orderData.contactInformation.fullName}`,
      html: emailHTML,
    });

    console.log('Order email sent successfully');
  } catch (error) {
    console.error('Error sending order email:', error);
    // Don't throw error to prevent order failure, but log it
  }
}

function generateOrderEmailHTML(orderData: OrderData, customerId: string): string {
  const totalItems = orderData.sizeSelection.reduce((total, item) => total + item.quantity, 0);
  
  const sizeRows = orderData.sizeSelection
    .filter(item => item.quantity > 0)
    .map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.size}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
      </tr>
    `).join('');

  const assetRows = Object.entries(orderData.assets)
    .filter(([, file]) => file !== null)
    .map(([key, file]) => {
      const placementMap: Record<string, string> = {
        "front-top-left": "Front - Top Left",
        "front-center": "Front - Center", 
        "back-top": "Back - Top",
        "back-bottom": "Back - Bottom"
      };
      
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${file?.name || 'Unknown file'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${placementMap[key] || key}</td>
        </tr>
      `;
    }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">New Order Received</h1>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #555; font-size: 18px;">Order Information</h2>
          <p><strong>Order ID:</strong> ${customerId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #555; font-size: 18px;">Customer Information</h2>
          <p><strong>Name:</strong> ${orderData.contactInformation.fullName}</p>
          <p><strong>Email:</strong> ${orderData.contactInformation.email}</p>
          <p><strong>Contact Number:</strong> ${orderData.contactInformation.contactNumber}</p>
          <p><strong>Address:</strong> ${orderData.contactInformation.address}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #555; font-size: 18px;">Product Details</h2>
          <p><strong>Product Type:</strong> ${orderData.productType}</p>
          <p><strong>Brand:</strong> ${orderData.brand}</p>
          <p><strong>Color:</strong> ${orderData.color}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #555; font-size: 18px;">Size and Quantity</h2>
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
          <p style="margin-top: 10px;"><strong>Total Items:</strong> ${totalItems}</p>
        </div>

        ${assetRows ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #555; font-size: 18px;">Uploaded Assets</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">File Name</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Placement</th>
              </tr>
            </thead>
            <tbody>
              ${assetRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>This is an automated message from your order system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}