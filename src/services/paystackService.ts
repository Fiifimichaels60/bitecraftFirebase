
'use server'

const PAYSTACK_API_URL = 'https://api.paystack.co';

interface PaymentInitiationRequest {
    email: string;
    amount: number; // in kobo/pesewas
    reference: string;
    metadata?: Record<string, any>;
}

export async function initiatePayment(paymentData: PaymentInitiationRequest): Promise<any> {
    console.log(`Initiating Paystack payment for order: ${paymentData.reference}`);

    const secretKey = 'sk_live_84b49fd51b2618609e93f0f3d99203b9a23f435c';

    if (!secretKey) {
        const errorMsg = 'Paystack Secret Key is not configured.';
        console.error(errorMsg);
        return { status: false, message: errorMsg };
    }
    console.log("Paystack settings loaded successfully.");

    const payload = {
        ...paymentData,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation`
    };

    console.log('Sending Paystack payment payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secretKey}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();
        
        console.log('Received Paystack API response:', JSON.stringify(responseData, null, 2));
        
        if (!responseData.status) {
            console.error(`Paystack API Error:`, responseData);
            return {
                status: false,
                message: responseData.message || 'Unknown Paystack error'
            };
        }
        
        return responseData;

    } catch (error) {
        console.error('An unexpected exception occurred while initiating Paystack payment:', error);
        return { status: false, message: 'An unexpected server error occurred while contacting Paystack.' };
    }
}
