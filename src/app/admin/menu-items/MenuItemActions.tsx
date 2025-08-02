
'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { FoodItem, Category } from '@/types';
import { deleteMenuItem } from '@/services/menuService';
import { MenuItemEditForm } from './MenuItemEditForm';

interface MenuItemActionsProps {
  item: FoodItem;
  categories: Category[];
  onRefresh: () => void;
}

export function MenuItemActions({ item, categories, onRefresh }: MenuItemActionsProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMenuItem(item.id, item.image);
      toast({
        title: 'Menu Item Deleted',
        description: `"${item.name}" has been successfully deleted.`,
      });
      onRefresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete menu item.',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    onRefresh();
  }

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
            <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemEditForm item={item} categories={categories} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              menu item "{item.name}".
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
