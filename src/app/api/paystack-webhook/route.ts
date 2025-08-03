
import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { updateOrderStatus } from '@/services/orderService';
import { updatePaymentStatusByOrderId } from '@/services/paymentService';

export async function POST(req: NextRequest) {
    console.log('Received Paystack webhook...');
    const secret = 'sk_live_84b49fd51b2618609e93f0f3d99203b9a23f435c';
    
    if (!secret) {
        console.error('Paystack secret key is not configured.');
        return new NextResponse('Configuration error: Paystack secret key is missing.', { status: 500 });
    }

    const body = await req.text();
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    const signature = req.headers.get('x-paystack-signature');

    if (hash !== signature) {
        console.warn('Webhook signature verification failed.');
        return new NextResponse('Signature verification failed.', { status: 401 });
    }
    
    console.log('Webhook signature verified successfully.');
    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
        const { reference, status, id: transactionId } = event.data;
        const orderId = reference;

        if (status === 'success') {
            try {
                console.log(`Processing successful payment for order ${orderId}...`);
                await updateOrderStatus(orderId, 'Completed');
                await updatePaymentStatusByOrderId(orderId, 'Succeeded', transactionId);
                console.log(`Successfully processed webhook for order ${orderId}. Status updated to Completed.`);
            } catch (error) {
                console.error(`Error updating status for order ${orderId}:`, error);
                return new NextResponse('Internal server error while updating order status.', { status: 500 });
            }
        } else {
             try {
                console.log(`Processing failed payment for order ${orderId}...`);
                await updateOrderStatus(orderId, 'Cancelled');
                await updatePaymentStatusByOrderId(orderId, 'Failed', transactionId);
                console.log(`Order ${orderId} status updated to Cancelled due to failed payment.`);
            } catch (error) {
                console.error(`Error updating status for failed order ${orderId}:`, error);
                return new NextResponse('Internal server error while updating order status.', { status: 500 });
            }
        }
    }

    return new NextResponse('Webhook received.', { status: 200 });
}
