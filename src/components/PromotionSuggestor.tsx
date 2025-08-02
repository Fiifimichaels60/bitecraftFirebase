'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleSuggestPromotions } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Tag } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
  promotions: [],
  error: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Get Promotions
    </Button>
  );
}

export function PromotionSuggestor() {
  const [state, formAction] = useActionState(handleSuggestPromotions, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: state.message,
        });
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sparkles className="text-accent" />
          Exclusive Local Deals
        </CardTitle>
        <CardDescription>
          Enter your location to find personalized promotions in your area!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="flex gap-2">
            <Input
              name="location"
              placeholder="e.g., Accra, Kumasi"
              required
            />
            <SubmitButton />
          </div>
        </form>
        {state.promotions && state.promotions.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Here are your deals:</h3>
            <ul className="list-none space-y-2">
              {state.promotions.map((promo, index) => (
                <li key={index} className="flex items-center gap-2 p-2 rounded-md bg-accent/20">
                    <Tag className="h-5 w-5 text-primary"/>
                    <span>{promo}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
