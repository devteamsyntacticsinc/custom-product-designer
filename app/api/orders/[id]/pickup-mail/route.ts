import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { OrderWithCustomer } from '@/types/order';
import { OrderService } from '@/lib/api/order';


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: rawId } = await params;
        // Handle potential "order-" prefix and convert to number
        const id = Number(rawId.replace('order-', ''));

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        // Fetch order
        const order = await OrderService.getOrderById(id);

        if (!order || !order.id) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Send pickup email
        const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
        if (!customer?.email) {
            return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
        }

        await sendPickupEmail(order);

        return NextResponse.json({ message: 'Pickup email sent successfully' });
    } catch (error: any) {
        console.error('Error sending pickup email:', error);
        return NextResponse.json({ error: error.message || 'Failed to send pickup email' }, { status: 500 });
    }
}

async function sendPickupEmail(order: OrderWithCustomer) {
    // Create reusable transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
    const brandName = order.products?.[0]?.brands?.name || '';
    const productTypeName = order.products?.[0]?.product_type?.name || 'Product';
    const productColor = order.colors?.[0]?.value || '';

    const sizeRows = order.product_sizes?.map(item => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.sizes?.value || 'Unknown'}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
        </tr>
    `).join('') || '';

    const totalItems = order.product_sizes?.reduce((total, item) => total + item.quantity, 0) || 0;

    const mailOptions = {
        from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
        to: customer?.email || '',
        subject: `Your Custom Product Order #${order.id} is Ready for Pickup`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Order Ready for Pickup</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Your Order is Ready for Pickup!</h1>
                
                <p style="color: #666; font-size: 16px;">Hi ${customer?.name || 'Valued Customer'}, great news! Your custom product order is now ready for pickup at our store.</p>
                
                <div style="margin-bottom: 20px;">
                  <h2 style="color: #555; font-size: 18px;">Order Information</h2>
                  <p><strong>Order ID:</strong> ${order.id}</p>
                  <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                </div>

                <div style="margin-bottom: 20px;">
                  <h2 style="color: #555; font-size: 18px;">Product Details</h2>
                  <p><strong>Product Type:</strong> ${productTypeName}</p>
                  <p><strong>Brand:</strong> ${brandName}</p>
                  <p><strong>Color:</strong> ${productColor}</p>
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

                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                    <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.5;">
                        <strong>We can't wait to see you!</strong><br>
                        Swing by Print Pro at your convenience to pick up your order — we’re excited to see you and share your custom creations!<br><br>
                        Curious about what else we can make for you? Visit our website: <a href="${process.env.NEXTAUTH_URL}" style="color: #0077cc; text-decoration: none;">${process.env.NEXTAUTH_URL}</a> to explore more products, designs, and special offers.
                    </p>
                </div>

                <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2c3e50; font-size: 18px;">Need Help?</h3>
                    <p style="margin: 0;">If you have any questions about your order, please contact us:</p>
                    <p style="margin: 10px 0 0 0;">
                        <strong>Email:</strong> ${process.env.COMPANY_OWNER_EMAIL}
                    </p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                  <p>Best regards,<br>Print Pro's Team</p>
                </div>
              </div>
            </body>
            </html>
        `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
}