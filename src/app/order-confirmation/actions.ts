
'use server';

import { z } from 'zod';
import { addRating } from '@/services/ratingService';

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type RatingData = z.infer<typeof ratingSchema>;

export async function handleRatingSubmission(data: RatingData) {
  const validatedFields = ratingSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: true,
      message: 'Invalid rating data.',
    };
  }

  try {
    await addRating(validatedFields.data);
    return {
      error: false,
      message: 'Rating submitted successfully!',
    };
  } catch (error) {
    console.error('Failed to submit rating:', error);
    return {
      error: true,
      message: 'There was an issue submitting your feedback.',
    };
  }
}
