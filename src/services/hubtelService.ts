
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
    console.log(`Initiating Hubtel payment for order: ${paymentData.clientReference}`);

    const settings = await getSettingsForServer();

    if (!settings.hubtelClientId || !settings.hubtelClientSecret || !settings.merchantAccountNumber) {
        const errorMsg = 'Hubtel API credentials or Merchant Account Number are not configured in settings.';
        console.error(errorMsg);
        return { success: false, message: errorMsg };
    }
    console.log("Hubtel settings loaded successfully.");
    console.log(`Using Hubtel Merchant Account: ${settings.merchantAccountNumber}`);


    // Ensure environment variables are defined or fall back to a reasonable default.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callbackUrl = process.env.HUBTEL_CALLBACK_URL || `${baseUrl}/api/hubtel-callback`;
    const returnUrl = process.env.HUBTEL_RETURN_URL || `${baseUrl}/order-confirmation`;
    const cancellationUrl = process.env.HUBTEL_CANCEL_URL || `${baseUrl}/checkout`;

    const payload = {
        totalAmount: paymentData.amount,
        description: paymentData.description,
        callbackUrl,
        returnUrl,
        cancellationUrl,
        merchantAccountNumber: settings.merchantAccountNumber,
        clientReference: paymentData.clientReference,
        customerName: paymentData.customerName,
        customerMsisdn: normalizePhoneNumber(paymentData.mobileNumber),
        channel: paymentData.channel,
    };

    console.log('Sending Hubtel payment payload:', JSON.stringify(payload, null, 2));

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
        
        console.log('Received Hubtel API response:', JSON.stringify(responseData, null, 2));
        
        // Hubtel can return 200 OK but still have a failure status in the body.
        if (!response.ok || (responseData.status && responseData.status !== "Success") || responseData.responseCode !== "0000") {
            console.error(`Hubtel API Error (HTTP Status: ${response.status}):`, responseData);
            const errorMessage = responseData.message || responseData.data?.message || 'Unknown Hubtel error';
            return {
                success: false,
                message: `Failed to initiate payment. Reason: ${errorMessage}`
            };
        }
        
        if (responseData.data && responseData.data.checkoutUrl) {
            console.log('Hubtel payment initiated successfully. Checkout URL received.');
             return {
                success: true,
                checkoutUrl: responseData.data.checkoutUrl,
            };
        } else {
            console.error('Checkout URL not found in successful Hubtel response body.');
            return { success: false, message: 'Checkout URL not found in the response from Hubtel.' };
        }

    } catch (error) {
        console.error('An unexpected exception occurred while initiating Hubtel payment:', error);
        return { success: false, message: 'An unexpected server error occurred while contacting Hubtel.' };
    }
}
