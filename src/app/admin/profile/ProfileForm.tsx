
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import { updateProfile } from './actions';

const profileSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const initialState = {
  message: '',
  error: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
        </Button>
    )
}

export function ProfileForm() {
    const { user } = useAuth();
    const [actionState, formAction] = useActionState(updateProfile, initialState);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            email: user?.email || '',
        },
    });

    useEffect(() => {
        if(actionState.message) {
            toast({
                variant: actionState.error ? 'destructive' : 'default',
                title: actionState.error ? 'Error' : 'Success',
                description: actionState.message,
            });
        }
    }, [actionState]);


  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="admin@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" name="currentEmail" value={user?.email || ''} />
        <SubmitButton />
      </form>
    </Form>
  );
}
