
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { handleContactUs } from './actions';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  location: z.string().min(2, 'Location is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      location: '',
      message: '',
    }
  });

  function onSubmit(data: ContactFormValues) {
    startTransition(async () => {
      const result = await handleContactUs(data);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      } else {
        toast({
          title: 'Message Sent!',
          description: 'Thank you for contacting us. We will get back to you shortly.',
        });
        form.reset();
      }
    });
  }
  
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Contact Us</h1>
        <p className="text-muted-foreground mt-2">
          We'd love to hear from you. Get in touch with us for any inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <Phone className="w-8 h-8 text-primary"/>
                    <div>
                        <CardTitle>Call Us</CardTitle>
                        <CardDescription>0247813865</CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <Mail className="w-8 h-8 text-primary"/>
                    <div>
                        <CardTitle>Email Us</CardTitle>
                        <CardDescription>hello@bitecraft.com</CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <MapPin className="w-8 h-8 text-primary"/>
                    <div>
                        <CardTitle>Our Location</CardTitle>
                        <CardDescription>Western Region, Takoradi, Ghana</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Send a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Takoradi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us what's on your mind..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Message
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
