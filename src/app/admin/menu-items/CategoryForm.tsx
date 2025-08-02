
'use client';

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
import { toast } from '@/hooks/use-toast';
import { addCategory } from '@/services/categoryService';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';


const categoryFormSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters.'),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(data: CategoryFormValues) {
    setIsLoading(true);
    try {
      await addCategory(data.name);
      toast({
        title: 'Category Added!',
        description: `The "${data.name}" category has been successfully created.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add category. Please check your Firebase rules and internet connection.',
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Desserts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Category
        </Button>
      </form>
    </Form>
  );
}
