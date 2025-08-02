
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
import { Loader2 } from 'lucide-react';
import { getSettings, updateSettings } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  deliveryFee: z.coerce.number().min(0, 'Delivery fee must be a positive number.'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function GeneralSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      deliveryFee: 0,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      try {
        const settings = await getSettings();
        form.reset({ deliveryFee: settings.deliveryFee || 0 });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load settings.',
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, [form]);

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true);
    try {
      await updateSettings(data);
      toast({
        title: 'Settings Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings.',
      });
    } finally {
      setIsLoading(false);
    }
  }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Loading settings...</span>
            </div>
        )
    }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            <FormField
            control={form.control}
            name="deliveryFee"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Delivery Fee (GH₵)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 5.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
            </Button>
        </form>
    </Form>
  );
}
