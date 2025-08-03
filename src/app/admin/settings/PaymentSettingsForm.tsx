
'use client';

import { useEffect, useState } from 'react';
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
import { getSettings, updateSettings } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

const paymentSchema = z.object({
  paystackPublicKey: z.string().min(1, 'Public Key is required.'),
  paystackSecretKey: z.string().min(1, 'Secret Key is required.'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paystackPublicKey: '',
      paystackSecretKey: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      try {
        const settings = await getSettings();
        form.reset({
          paystackPublicKey: settings.paystackPublicKey || '',
          paystackSecretKey: settings.paystackSecretKey || '',
        });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, [form]);

  async function onSubmit(data: PaymentFormValues) {
    setIsLoading(true);
    try {
      await updateSettings(data);
      toast({
        title: 'Payment Settings Updated',
        description: 'Your Paystack API keys have been saved.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save payment settings.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Loading payment settings...</span>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="paystackPublicKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paystack Public Key</FormLabel>
              <FormControl>
                <Input placeholder="pk_live_..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paystackSecretKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paystack Secret Key</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="sk_live_..."
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-sm text-muted-foreground">
            Find your API keys on the{' '}
            <Link href="https://dashboard.paystack.com/#/settings/developers" target="_blank" className="text-primary underline">
                Paystack Developer settings
            </Link>.
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save API Keys
        </Button>
      </form>
    </Form>
  );
}
