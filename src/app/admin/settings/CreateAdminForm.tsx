
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
import { createAdminUser } from './actions';


const createAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type CreateAdminFormValues = z.infer<typeof createAdminSchema>;

const initialState = {
  message: '',
  error: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Admin
        </Button>
    )
}

export function CreateAdminForm() {
    const [actionState, formAction] = useActionState(createAdminUser, initialState);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<CreateAdminFormValues>({
        resolver: zodResolver(createAdminSchema),
        defaultValues: {
            email: '',
            password: '',
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

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    form.handleSubmit(() => formAction(formData))();
  };

  return (
    <Form {...form}>
      <form onSubmit={onFormSubmit} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Admin Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="admin@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
        <SubmitButton />
      </form>
    </Form>
  );
}

