
import { updateOrderStatus } from '@/services/orderService';
import { updatePaymentStatusByOrderId } from '@/services/paymentService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        console.log('Hubtel callback received:', JSON.stringify(payload, null, 2));

        if (payload.ResponseCode === "0000" && payload.Status === "Success" && payload.Data) {
            const orderId = payload.Data.ClientReference;
            const transactionId = payload.Data.CheckoutId || payload.Data.SalesInvoiceId;

            if (!orderId) {
                console.error('ClientReference (orderId) not found in Hubtel callback.');
                return new NextResponse('ClientReference missing', { status: 400 });
            }

            // Update statuses in Firestore
            await updateOrderStatus(orderId, 'Completed');
            await updatePaymentStatusByOrderId(orderId, 'Succeeded', transactionId);

            console.log(`Successfully processed callback for order ${orderId}.`);
            
        } else {
            const orderId = payload.Data?.ClientReference;
            console.warn(`Payment failed or was cancelled for order ${orderId || 'Unknown'}. Status: ${payload.Status}`);
            if (orderId) {
                await updateOrderStatus(orderId, 'Cancelled');
                await updatePaymentStatusByOrderId(orderId, 'Failed');
            }
        }

        // Respond to Hubtel to acknowledge receipt.
        return NextResponse.json({ message: "Callback received and processed." });

    } catch (err) {
        console.error('Error processing Hubtel callback:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
