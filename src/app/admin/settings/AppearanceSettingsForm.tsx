
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
import { Loader2, Monitor, Moon, Sun } from 'lucide-react';
import { getSettings, updateSettings } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';
import type { AppSettings } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';

const appearanceSchema = z.object({
  primaryColor: z.string().regex(/^(\d{1,3}\s\d{1,3}%\s\d{1,3}%)$/, 'Invalid HSL color format.'),
  accentColor: z.string().regex(/^(\d{1,3}\s\d{1,3}%\s\d{1,3}%)$/, 'Invalid HSL color format.'),
  sidebarColor: z.string().regex(/^(\d{1,3}\s\d{1,3}%\s\d{1,3}%)$/, 'Invalid HSL color format.'),
  sidebarAccentColor: z.string().regex(/^(\d{1,3}\s\d{1,3}%\s\d{1,3}%)$/, 'Invalid HSL color format.'),
  sidebarPosition: z.enum(['left', 'right']),
  theme: z.enum(['light', 'dark', 'system']),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

const colors = {
  primary: [
    { name: 'Orange', value: '25 87% 54%' },
    { name: 'Blue', value: '221 83% 53%' },
    { name: 'Green', value: '142 76% 36%' },
    { name: 'Rose', value: '346 76% 60%' },
    { name: 'Yellow', value: '48 96% 53%' },
  ],
  accent: [
    { name: 'Orange', value: '39 100% 60%' },
    { name: 'Blue', value: '215 80% 65%' },
    { name: 'Green', value: '142 60% 45%' },
    { name: 'Rose', value: '340 80% 65%' },
    { name: 'Yellow', value: '45 90% 55%' },
  ],
  sidebar: [
    { name: 'Zinc', value: '240 10% 3.9%' },
    { name: 'Slate', value: '215 28% 17%' },
    { name: 'Stone', value: '25 15% 15%' },
    { name: 'Gray', value: '220 9% 15%' },
    { name: 'Neutral', value: '0 0% 15%' },
  ]
};

export function AppearanceSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { setTheme } = useTheme();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      primaryColor: '25 87% 54%',
      accentColor: '39 100% 60%',
      sidebarColor: '240 10% 3.9%',
      sidebarAccentColor: '25 87% 54%',
      sidebarPosition: 'left',
      theme: 'system',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      try {
        const settings = await getSettings();
        form.reset({
          primaryColor: settings.primaryColor || '25 87% 54%',
          accentColor: settings.accentColor || '39 100% 60%',
          sidebarColor: settings.sidebarColor || '240 10% 3.9%',
          sidebarAccentColor: settings.sidebarAccentColor || '25 87% 54%',
          sidebarPosition: settings.sidebarPosition || 'left',
          theme: settings.theme || 'system',
        });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, [form]);

  async function onSubmit(data: AppearanceFormValues) {
    setIsLoading(true);
    try {
      await updateSettings(data);
      // Update CSS variables dynamically
      document.documentElement.style.setProperty('--primary', data.primaryColor);
      document.documentElement.style.setProperty('--accent', data.accentColor);
      document.documentElement.style.setProperty('--sidebar-background', data.sidebarColor);
      document.documentElement.style.setProperty('--sidebar-primary', data.sidebarAccentColor);
      document.documentElement.style.setProperty('--sidebar-ring', data.sidebarAccentColor);
      setTheme(data.theme);
      
      toast({
        title: 'Appearance Updated',
        description: 'Your theme has been updated. Refresh may be needed to see all changes.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save appearance settings.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Loading appearance settings...</span>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        
        <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
                <FormItem className="space-y-3">
                <FormLabel>Theme</FormLabel>
                <FormMessage />
                <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid max-w-md grid-cols-2 gap-8 pt-2 md:grid-cols-3"
                >
                    <FormItem>
                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                        <FormControl>
                        <RadioGroupItem value="light" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                        </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                        Light
                        </span>
                    </FormLabel>
                    </FormItem>
                    <FormItem>
                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                        <FormControl>
                        <RadioGroupItem value="dark" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:border-accent">
                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                        </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                        Dark
                        </span>
                    </FormLabel>
                    </FormItem>
                     <FormItem>
                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                        <FormControl>
                        <RadioGroupItem value="system" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:border-accent flex justify-center h-full">
                           <div className="flex items-center gap-2">
                            <Sun className="h-6 w-6 text-orange-400"/>
                             <span className="font-bold text-2xl">/</span>
                            <Moon className="h-6 w-6"/>
                           </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                        System
                        </span>
                    </FormLabel>
                    </FormItem>
                </RadioGroup>
                </FormItem>
            )}
        />


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-medium mb-4">Main Colors</h3>
                <div className="space-y-6">
                    <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                            <div className="flex gap-2">
                            {colors.primary.map(color => (
                                <button
                                key={color.name}
                                type="button"
                                onClick={() => field.onChange(color.value)}
                                className="h-8 w-8 rounded-full border-2"
                                style={{ 
                                    backgroundColor: `hsl(${color.value})`,
                                    borderColor: field.value === color.value ? `hsl(${color.value})` : 'transparent',
                                    outline: field.value === color.value ? '2px solid hsl(var(--ring))' : 'none'
                                }}
                                aria-label={`Select ${color.name} as primary color`}
                                />
                            ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <FormControl>
                            <div className="flex gap-2">
                            {colors.accent.map(color => (
                                <button
                                key={color.name}
                                type="button"
                                onClick={() => field.onChange(color.value)}
                                className="h-8 w-8 rounded-full border-2"
                                style={{ 
                                    backgroundColor: `hsl(${color.value})`,
                                    borderColor: field.value === color.value ? `hsl(${color.value})` : 'transparent',
                                    outline: field.value === color.value ? '2px solid hsl(var(--ring))' : 'none'
                                }}
                                aria-label={`Select ${color.name} as accent color`}
                                />
                            ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium mb-4">Sidebar</h3>
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="sidebarColor"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Sidebar Background</FormLabel>
                            <FormControl>
                                <div className="flex gap-2">
                                {colors.sidebar.map(color => (
                                    <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => field.onChange(color.value)}
                                    className="h-8 w-8 rounded-full border-2"
                                    style={{ 
                                        backgroundColor: `hsl(${color.value})`,
                                        borderColor: field.value === color.value ? `hsl(${color.value})` : 'transparent',
                                        outline: field.value === color.value ? '2px solid hsl(var(--ring))' : 'none'
                                    }}
                                    aria-label={`Select ${color.name} as sidebar background`}
                                    />
                                ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sidebarAccentColor"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Sidebar Accent Color</FormLabel>
                            <FormControl>
                                <div className="flex gap-2">
                                {colors.primary.map(color => (
                                    <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => field.onChange(color.value)}
                                    className="h-8 w-8 rounded-full border-2"
                                    style={{ 
                                        backgroundColor: `hsl(${color.value})`,
                                        borderColor: field.value === color.value ? `hsl(${color.value})` : 'transparent',
                                        outline: field.value === color.value ? '2px solid hsl(var(--ring))' : 'none'
                                    }}
                                    aria-label={`Select ${color.name} as sidebar accent color`}
                                    />
                                ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="sidebarPosition"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Sidebar Position</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                                >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="left" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Left</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="right" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Right</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
       
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Appearance
        </Button>
      </form>
    </Form>
  );
}
