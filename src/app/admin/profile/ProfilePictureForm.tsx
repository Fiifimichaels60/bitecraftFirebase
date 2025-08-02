
'use client';

import { useState, useRef, useTransition } from 'react';
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
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import { updateProfilePicture } from './actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Cookies from 'js-cookie';


const profilePictureSchema = z.object({
  profilePicture: z.instanceof(FileList).refine(files => files?.length === 1, 'Profile picture is required.'),
});

type ProfilePictureFormValues = z.infer<typeof profilePictureSchema>;


export function ProfilePictureForm() {
    const { user } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();
    
    const form = useForm<ProfilePictureFormValues>({
        resolver: zodResolver(profilePictureSchema),
    });

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const pfpRef = form.register('profilePicture');
  
  const handleSubmit = async (data: ProfilePictureFormValues) => {
    const formData = new FormData();
    formData.append('profilePicture', data.profilePicture[0]);

    const sessionToken = Cookies.get('__session');
    if (!sessionToken) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Authentication session not found. Please log in again.',
        });
        return;
    }


    startTransition(async () => {
        const result = await updateProfilePicture(formData, sessionToken);
        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        } else {
            toast({
                title: 'Success',
                description: result.message,
            });
            form.reset();
            formRef.current?.reset();
             // Force a reload to show the new profile picture in the layout
            window.location.reload();
        }
    });
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-md">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
              <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
            </Avatar>
            <FormField
                control={form.control}
                name="profilePicture"
                render={() => (
                    <FormItem>
                        <FormLabel>Update Profile Picture</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                {...pfpRef}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Picture
        </Button>
      </form>
    </Form>
  );
}
