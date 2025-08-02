
'use client';

import Image from 'next/image';
import type { FoodItem } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartProvider';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

interface FoodListItemProps {
  item: FoodItem;
}

export function FoodListItem({ item }: FoodListItemProps) {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast({
      title: 'Added to cart!',
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-xl shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-card">
      <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 border">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          data-ai-hint={item['data-ai-hint']}
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold font-headline">{item.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
      </div>
      <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
        <p className="text-lg font-bold text-primary whitespace-nowrap">GH₵{item.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart} size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
