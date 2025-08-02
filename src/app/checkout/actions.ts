
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

    const { name, email, phone, address, cartItems, total, deliveryMethod, channel } = validatedFields.data;
    
    await addVisitorIfNotExists({ name, phone, email });

    const items: CartItem[] = JSON.parse(cartItems);
    
    const customerId = await findOrCreateCustomer({ name, email, phone, location: address || 'Self-pickup' });

    const orderData = {
      customerId,
      items,
      total,
      subtotal: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      deliveryFee: deliveryMethod === 'delivery' ? (total - items.reduce((acc, item) => acc + item.price * item.quantity, 0)) : 0,
      status: 'Pending',
      deliveryMethod,
      channel,
    }
    const orderId = await createOrder(orderData);
    
    await createPayment(orderId, total, 'Pending');
    
    const paymentResponse = await initiatePayment({
      amount: total,
      description: `Payment for order #${orderId}`,
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

    revalidatePath('/admin/orders');
    revalidatePath('/admin/customers');
    revalidatePath('/admin/payments');
    revalidatePath('/admin');

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
