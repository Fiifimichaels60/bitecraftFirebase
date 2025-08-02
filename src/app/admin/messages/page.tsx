
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, MailOpen, Mail } from 'lucide-react';
import { getMessages, updateMessageStatus, deleteMessage } from '@/services/messageService';
import type { Message } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Message | null>(null);
  const { user } = useAuth();

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const fetchedMessages = await getMessages();
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load messages.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);
  
  const handleToggleReadStatus = async (message: Message) => {
      setIsUpdating(message.id);
      try {
          await updateMessageStatus(message.id, !message.isRead, user?.email ?? 'N/A');
          toast({ title: 'Success', description: `Message marked as ${!message.isRead ? 'read' : 'unread'}.`})
          fetchMessages(); // Refresh the list
      } catch (error) {
          console.error("Failed to update message:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not update message status.' });
      } finally {
          setIsUpdating(null);
      }
  }
  
  const handleDelete = async (messageId: string) => {
      setIsDeleting(messageId);
       try {
          await deleteMessage(messageId, user?.email ?? 'N/A');
          toast({ title: 'Success', description: 'Message deleted successfully.'})
          fetchMessages(); // Refresh the list
      } catch (error) {
          console.error("Failed to delete message:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not delete message.' });
      } finally {
          setIsDeleting(null);
          setItemToDelete(null);
      }
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Contact Messages</CardTitle>
        <CardDescription>Messages submitted through the contact form.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {messages.map((message) => (
              <AccordionItem key={message.id} value={message.id}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                        <Badge variant={message.isRead ? 'secondary' : 'default'}>
                            {message.isRead ? 'Read' : 'Unread'}
                        </Badge>
                        <div className="text-left">
                            <p className="font-semibold">{message.name}</p>
                            <p className="text-sm text-muted-foreground">{message.phone}</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{format(message.createdAt, 'PPpp')}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                      <p><strong className="font-semibold">Location:</strong> {message.location}</p>
                      <p className="whitespace-pre-wrap"><strong className="font-semibold">Message:</strong> {message.message}</p>
                      <div className="flex gap-2 pt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleReadStatus(message)}
                            disabled={isUpdating === message.id}
                          >
                              {isUpdating === message.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (message.isRead ? <Mail className="mr-2"/> : <MailOpen className="mr-2"/>)}
                              {message.isRead ? 'Mark as Unread' : 'Mark as Read'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setItemToDelete(message)}
                            disabled={isDeleting === message.id}
                          >
                             {isDeleting === message.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2"/>}
                              Delete
                          </Button>
                      </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-sm text-muted-foreground p-4 text-center">No messages found.</p>
        )}
      </CardContent>
    </Card>

    <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              message from "{itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(itemToDelete!.id)} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
