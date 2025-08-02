
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import type { Category } from '@/types';
import { useState } from 'react';
import { addMenuItem } from '@/services/menuService';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const menuItemFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string({ required_error: 'Please select a category.' }),
  imageType: z.enum(['file', 'link']),
  imageFile: z.instanceof(FileList).optional(),
  imageUrl: z.string().optional(),
}).refine(data => {
    if (data.imageType === 'link') {
        return !!data.imageUrl && z.string().url().safeParse(data.imageUrl).success;
    }
    return true;
}, {
    message: 'A valid image URL is required.',
    path: ['imageUrl'],
}).refine(data => {
    if (data.imageType === 'file') {
        return data.imageFile && data.imageFile.length > 0;
    }
    return true;
}, {
    message: 'An image file is required.',
    path: ['imageFile'],
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  categories: Category[];
  onSuccess?: () => void;
}

export function MenuItemForm({ categories, onSuccess }: MenuItemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
        name: '',
        description: '',
        price: 0,
        category: '',
        imageType: 'file',
        imageUrl: '',
        imageFile: undefined,
    }
  });

  const imageType = form.watch('imageType');
  const imageFileRef = form.register('imageFile');

  async function onSubmit(data: MenuItemFormValues) {
    setIsLoading(true);
    try {
        const image = data.imageType === 'file' ? data.imageFile![0] : data.imageUrl!;
        const { imageFile, imageUrl, imageType, ...itemData } = data;

        await addMenuItem(itemData, image);
        toast({
            title: 'Menu Item Added!',
            description: `"${data.name}" has been successfully added to the menu.`,
        });
        form.reset();
        onSuccess?.();
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to add menu item. Please check your Firebase rules and internet connection.',
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
              <FormLabel>Food Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jollof Rice" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A short, enticing description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Price (GH₵)</FormLabel>
            <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 25.00" {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a food category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="imageType"
            render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>Image Source</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="file" />
                            </FormControl>
                            <FormLabel className="font-normal">Upload Image</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="link" />
                            </FormControl>
                            <FormLabel className="font-normal">Image URL</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        {imageType === 'file' ? (
            <FormField
                control={form.control}
                name="imageFile"
                render={() => (
                    <FormItem>
                        <FormLabel>Food Image</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                {...imageFileRef}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ) : (
            <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )}


        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Menu Item
        </Button>
      </form>
    </Form>
  );
}
