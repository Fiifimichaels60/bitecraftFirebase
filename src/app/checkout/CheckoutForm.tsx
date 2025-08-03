
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, useRef } from 'react';

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
import { useCart } from '@/contexts/CartProvider';
import { toast } from '@/hooks/use-toast';
import { handleCheckout } from './actions';
import { Loader2, CreditCard } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  email: z.string().email('Please enter a valid email address.'),
  address: z.string().optional(),
  deliveryMethod: z.enum(['delivery', 'pickup']),
  channel: z.string({ required_error: 'Please select a payment channel.' }),
}).refine(data => {
    if (data.deliveryMethod === 'delivery') {
        return !!data.address && data.address.length >= 5;
    }
    return true;
}, {
    message: 'Please enter a valid delivery address.',
    path: ['address'],
});


type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
    total: number;
    deliveryMethod: 'delivery' | 'pickup';
}

export function CheckoutForm({ total, deliveryMethod }: CheckoutFormProps) {
  const router = useRouter();
  const { state, dispatch } = useCart();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      deliveryMethod: deliveryMethod,
      channel: '',
    },
  });

  useEffect(() => {
    form.setValue('deliveryMethod', deliveryMethod);
  }, [deliveryMethod, form]);
  
  const onFormSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                formData.set(key, value as string);
            }
        });
        formData.set('cartItems', JSON.stringify(state.items));
        formData.set('total', total.toString());
        
        const result = await handleCheckout(null, formData);

        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        } else if (result.checkoutUrl) {
            // Clear cart before redirecting to Hubtel's page to complete payment
            dispatch({ type: 'CLEAR_CART' });
            window.location.href = result.checkoutUrl;
        } else {
            // This case should ideally not happen with Hubtel flow, but as a fallback.
            dispatch({ type: 'CLEAR_CART' });
            router.push('/order-confirmation');
        }
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onFormSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Ato Kwamena" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="024 123 4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {deliveryMethod === 'delivery' && (
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Address</FormLabel>
                <FormControl>
                  <Input placeholder="SSNIT House, Takoradi" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Channel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mtn-gh">MTN Mobile Money</SelectItem>
                  <SelectItem value="vodafone-gh">Vodafone Cash</SelectItem>
                  <SelectItem value="airteltigo-gh">AirtelTigo Money</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Processing...' : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Confirm & Pay GH₵{total.toFixed(2)}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
