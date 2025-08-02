
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
  hubtelClientId: z.string().min(1, 'Client ID is required.'),
  hubtelClientSecret: z.string().min(1, 'Client Secret is required.'),
  merchantAccountNumber: z.string().min(1, 'Merchant Account Number is required.'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      hubtelClientId: '',
      hubtelClientSecret: '',
      merchantAccountNumber: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      try {
        const settings = await getSettings();
        form.reset({
          hubtelClientId: settings.hubtelClientId || '',
          hubtelClientSecret: settings.hubtelClientSecret || '',
          merchantAccountNumber: settings.merchantAccountNumber || '',
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
        description: 'Your Hubtel API keys have been saved.',
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
          name="merchantAccountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hubtel Merchant Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Your Hubtel account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hubtelClientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hubtel Client ID</FormLabel>
              <FormControl>
                <Input placeholder="Your Hubtel Client ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hubtelClientSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hubtel Client Secret</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Your Hubtel Client Secret"
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
            <Link href="https://explore.hubtel.com/developers/" target="_blank" className="text-primary underline">
                Hubtel Developer portal
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
