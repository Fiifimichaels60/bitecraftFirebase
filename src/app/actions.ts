
'use server';

import { suggestPromotions, type SuggestPromotionsInput } from '@/ai/flows/suggest-promotions';
import { z } from 'zod';
import { logActivity } from '@/services/activityLogService';
import { headers } from 'next/headers';


const formSchema = z.object({
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
});

export async function handleSuggestPromotions(prevState: any, formData: FormData) {
  try {
    const input = {
      location: formData.get('location') as string,
    };

    const validatedFields = formSchema.safeParse(input);
    if (!validatedFields.success) {
      return {
        message: 'Invalid location provided.',
        promotions: [],
        error: true,
      };
    }
    
    const result = await suggestPromotions(validatedFields.data);
    return {
      message: 'Here are your personalized promotions!',
      promotions: result.promotions,
      error: false,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to get promotions. Please try again later.',
      promotions: [],
      error: true,
    };
  }
}

export async function logPageView(pathname: string) {
    // Avoid logging admin page views this way for now to reduce noise.
    // A more robust solution could filter based on user roles.
    if (!pathname.startsWith('/admin')) {
        const ip = headers().get('x-forwarded-for') ?? 'Unknown';
        await logActivity('page_view', `Visitor viewed page: ${pathname}`, { ip });
    }
}
