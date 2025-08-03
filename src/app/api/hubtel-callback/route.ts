
import { updateOrderStatus } from '@/services/orderService';
import { updatePaymentStatusByOrderId } from '@/services/paymentService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        console.log('Hubtel callback received:', JSON.stringify(payload, null, 2));

        // Hubtel's success codes for mobile money are "0000" or "000"
        const isSuccessful = payload.ResponseCode === "0000" || payload.ResponseCode === "000";

        if (isSuccessful && payload.Status === "Success" && payload.Data) {
            const orderId = payload.Data.ClientReference;
            const transactionId = payload.Data.CheckoutId || payload.Data.SalesInvoiceId;

            if (!orderId) {
                console.error('ClientReference (orderId) not found in successful Hubtel callback.');
                return new NextResponse('Callback received but ClientReference is missing.', { status: 400 });
            }
            
            console.log(`Processing successful callback for order ${orderId}...`);

            // Update statuses in Firestore
            await updateOrderStatus(orderId, 'Completed');
            await updatePaymentStatusByOrderId(orderId, 'Succeeded', transactionId);

            console.log(`Successfully processed callback for order ${orderId}. Status updated to Completed.`);
            
        } else {
            const orderId = payload.Data?.ClientReference;
            const status = payload.Status || 'Unknown';
            const responseCode = payload.ResponseCode || 'Unknown';
            console.warn(`Payment failed or was cancelled for order ${orderId || 'Unknown'}. Status: ${status}, ResponseCode: ${responseCode}`);
            
            if (orderId) {
                await updateOrderStatus(orderId, 'Cancelled');
                await updatePaymentStatusByOrderId(orderId, 'Failed');
                 console.log(`Order ${orderId} status updated to Cancelled due to failed payment.`);
            }
        }

        // Respond to Hubtel to acknowledge receipt.
        // This is crucial, otherwise Hubtel will keep retrying.
        return NextResponse.json({ message: "Callback received and processed." });

    } catch (err) {
        console.error('Error processing Hubtel callback:', err);
        // Still return a 200 to Hubtel if possible to prevent retries, even if our system has an error.
        return new NextResponse('Internal Server Error while processing callback.', { status: 500 });
    }
}
