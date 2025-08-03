
'use server';

import { z } from 'zod';
import { findOrCreateCustomer } from '@/services/customerService';
import { createOrder } from '@/services/orderService';
import { createPayment } from '@/services/paymentService';
import { revalidatePath } from 'next/cache';
import type { CartItem } from '@/types';
import { initiatePayment } from '@/services/hubtelService';
import { addVisitorIfNotExists } from '@/services/visitorService';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  email: z.string().email('Please enter a valid email address.'),
  address: z.string().optional(),
  cartItems: z.string(), // JSON string of cart items
  total: z.coerce.number(),
  deliveryMethod: z.enum(['delivery', 'pickup']),
  channel: z.string().min(1, 'Payment channel is required.'),
}).refine(data => {
    if (data.deliveryMethod === 'delivery') {
        return !!data.address && data.address.length >= 5;
    }
    return true;
}, {
    message: 'Delivery address is required and must be at least 5 characters.',
    path: ['address'],
});

export async function handleCheckout(prevState: any, formData: FormData) {
  console.log('--- Starting Checkout Process ---');
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = checkoutSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Checkout form validation failed:", validatedFields.error.flatten().fieldErrors);
        return {
            message: 'Invalid form data provided. Please check your inputs.',
            error: true,
        };
    }
    console.log("Step 1: Form data validated successfully.");

    const { name, email, phone, address, cartItems, total, deliveryMethod, channel } = validatedFields.data;
    
    await addVisitorIfNotExists({ name, phone, email });
    console.log('Step 2: Visitor record checked/created.');

    const items: CartItem[] = JSON.parse(cartItems);
    
    const customerId = await findOrCreateCustomer({ name, email, phone, location: address || 'Self-pickup' });
    console.log(`Step 3: Customer found or created with ID: ${customerId}`);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = deliveryMethod === 'delivery' ? (total - subtotal) : 0;

    const orderData = {
      customerId,
      items,
      total,
      subtotal,
      deliveryFee,
      status: 'Pending' as const,
      deliveryMethod,
      channel,
    }
    const orderId = await createOrder(orderData);
    console.log(`Step 4: Order created with ID: ${orderId}`);
    
    await createPayment(orderId, total, 'Pending');
    console.log(`Step 5: Initial payment record created for order ${orderId}.`);
    
    console.log(`Step 6: Initiating Hubtel payment for order ${orderId}...`);
    const paymentResponse = await initiatePayment({
      amount: total,
      description: `Payment for Bite Craft Order #${orderId}`,
      clientReference: orderId,
      customerName: name,
      mobileNumber: phone,
      channel,
    });

    if (!paymentResponse.success || !paymentResponse.checkoutUrl) {
      console.error('Failed to initiate Hubtel payment:', paymentResponse.message);
      return {
        message: paymentResponse.message || 'Could not initiate payment with Hubtel.',
        error: true,
      }
    }
    console.log('Step 7: Hubtel payment initiated. Redirecting user...');

    revalidatePath('/admin/orders');
    revalidatePath('/admin/customers');
    revalidatePath('/admin/payments');
    revalidatePath('/admin');
    console.log('--- Checkout Process Successful ---');

    return {
        message: 'Payment initiated successfully!',
        error: false,
        checkoutUrl: paymentResponse.checkoutUrl,
    }

  } catch (error) {
    console.error('Checkout failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Failed to place order due to a server error. Details: ${errorMessage}`,
      error: true,
    };
  }
}
