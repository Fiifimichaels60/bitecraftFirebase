
'use server'

import { getSettingsForServer } from "./settingsService";
import { z }from 'zod';

const HUBTEL_API_URL = 'https://api.hubtel.com/v1/merchantaccount/checkout/initiate';

const paymentInitiationRequestSchema = z.object({
    amount: z.number(),
    description: z.string(),
    clientReference: z.string(),
    customerName: z.string(),
    mobileNumber: z.string(),
    channel: z.string(),
});
type PaymentInitiationRequest = z.infer<typeof paymentInitiationRequestSchema>;

interface PaymentResponse {
    success: boolean;
    message?: string;
    checkoutUrl?: string;
}

function normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\s+/g, ''); 
    if (cleaned.startsWith('+233')) {
        return cleaned.substring(1);
    }
    if (cleaned.startsWith('0')) {
        return '233' + cleaned.substring(1);
    }
    return cleaned; 
}


export async function initiatePayment(paymentData: PaymentInitiationRequest): Promise<PaymentResponse> {
    console.log('Initiating Hubtel payment for:', paymentData.clientReference);

    const settings = await getSettingsForServer();

    if (!settings.hubtelClientId || !settings.hubtelClientSecret || !settings.merchantAccountNumber) {
        const errorMsg = 'Hubtel API credentials or Merchant Account Number are not configured.';
        console.error(errorMsg);
        return { success: false, message: errorMsg };
    }

    const payload = {
        totalAmount: paymentData.amount,
        description: paymentData.description,
        callbackUrl: process.env.HUBTEL_CALLBACK_URL,
        returnUrl: process.env.HUBTEL_RETURN_URL,
        cancellationUrl: process.env.HUBTEL_CANCEL_URL,
        merchantAccountNumber: settings.merchantAccountNumber,
        clientReference: paymentData.clientReference,
        customerName: paymentData.customerName,
        customerMsisdn: normalizePhoneNumber(paymentData.mobileNumber),
        channel: paymentData.channel,
    };

    try {
        const response = await fetch(HUBTEL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${settings.hubtelClientId}:${settings.hubtelClientSecret}`).toString('base64')}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();
        
        if (!response.ok || (responseData.status && responseData.status !== "Success")) {
            console.error(`Hubtel API Error (${response.status}):`, responseData);
            const errorMessage = responseData.message || 'Unknown Hubtel error';
            return {
                success: false,
                message: `Failed to initiate payment. Reason: ${errorMessage}`
            };
        }
        
        console.log('Hubtel payment initiated successfully:', responseData);

        if (responseData.data && responseData.data.checkoutUrl) {
             return {
                success: true,
                checkoutUrl: responseData.data.checkoutUrl,
            };
        } else {
            console.error('Checkout URL not found in Hubtel response');
            return { success: false, message: 'Checkout URL not found in the response from Hubtel.' };
        }

    } catch (error) {
        console.error('Error initiating Hubtel payment:', error);
        return { success: false, message: 'An unexpected error occurred while contacting Hubtel.' };
    }
}
