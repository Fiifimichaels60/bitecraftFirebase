
'use server';

import { z } from 'zod';
import { addMessage } from '@/services/messageService';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  location: z.string().min(2, 'Location is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export async function handleContactUs(data: ContactFormValues) {
  const validatedFields = contactFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: true,
      message: 'Invalid data provided.',
    };
  }

  try {
    await addMessage(validatedFields.data);
    return {
      error: false,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    return {
      error: true,
      message: 'There was a problem sending your message. Please try again later.',
    };
  }
}
