
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleRatingSubmission } from './actions';

export function RatingForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a star rating before submitting.',
      });
      return;
    }

    startTransition(async () => {
      const result = await handleRatingSubmission({ rating, comment });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      } else {
        toast({
          title: 'Feedback Submitted!',
          description: 'Thank you for rating our service.',
        });
        setRating(0);
        setComment('');
      }
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Rate Your Experience</CardTitle>
        <CardDescription>Let us know how we did.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-8 h-8 cursor-pointer transition-colors',
                  (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                )}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Tell us more about your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isPending}
            className="min-h-[100px]"
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
