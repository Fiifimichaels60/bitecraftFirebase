
'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/hooks/use-toast';
import type { Visitor } from '@/types';
import { deleteVisitor } from '@/services/visitorService';

interface VisitorActionsProps {
  visitor: Visitor;
  onRefresh: () => void;
}

export function VisitorActions({ visitor, onRefresh }: VisitorActionsProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteVisitor(visitor.id);
      toast({
        title: 'Visitor Deleted',
        description: `The record for "${visitor.name}" has been successfully deleted.`,
      });
      onRefresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete visitor record.',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              visitor record for "{visitor.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
