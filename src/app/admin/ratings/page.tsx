
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Star } from 'lucide-react';
import { getRatings, deleteRating } from '@/services/ratingService';
import type { Rating } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from '@/hooks/use-toast';
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

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    )
}

export default function RatingsPage() {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<Rating | null>(null);
    const { user } = useAuth();

    const fetchRatings = async () => {
        setIsLoading(true);
        try {
            const fetchedRatings = await getRatings();
            setRatings(fetchedRatings);
        } catch (error) {
            console.error("Failed to fetch ratings:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load ratings.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRatings();
    }, []);

    const handleDelete = async (ratingId: string) => {
        try {
            await deleteRating(ratingId, user?.email ?? undefined);
            toast({ title: 'Success', description: 'Rating deleted successfully.' });
            fetchRatings(); // Refresh list
        } catch (error) {
            console.error("Failed to delete rating:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete rating.' });
        } finally {
            setItemToDelete(null);
        }
    };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Customer Ratings</CardTitle>
        <CardDescription>Feedback submitted by your customers.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Loading ratings...</span>
            </div>
        ) : ratings.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead className="w-[200px]">Date</TableHead>
                        <TableHead className="w-16 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ratings.map((rating) => (
                        <TableRow key={rating.id}>
                            <TableCell><StarRating rating={rating.rating} /></TableCell>
                            <TableCell className="text-muted-foreground">{rating.comment || 'N/A'}</TableCell>
                            <TableCell>{format(rating.createdAt, 'PPpp')}</TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setItemToDelete(rating)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            <p className="text-sm text-muted-foreground p-4 text-center">No ratings found yet.</p>
        )}
      </CardContent>
    </Card>

    <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this rating.
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
