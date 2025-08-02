
'use client';

import { useActionState, useState, useEffect } from 'react';
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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updatePassword } from './actions';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters.'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});


type PasswordFormValues = z.infer<typeof passwordSchema>;

const initialState = {
  message: '',
  error: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
        </Button>
    )
}

export function ChangePasswordForm() {
    const [actionState, formAction] = useActionState(updatePassword, initialState);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if(actionState.message) {
            if(actionState.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: actionState.message,
                });
            } else {
                toast({
                    title: 'Success',
                    description: actionState.message,
                });
                form.reset();
            }
        }
    }, [actionState, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
               <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
               <div className="relative">
                <FormControl>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton />
      </form>
    </Form>
  );
}
