
'use client';

import Image from 'next/image';
import type { FoodItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCart } from '@/contexts/CartProvider';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

interface FoodCardProps {
  item: FoodItem;
}

export function FoodCard({ item }: FoodCardProps) {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast({
      title: 'Added to cart!',
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full group">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint={item['data-ai-hint']}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-2">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 h-[40px]">{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center mt-auto">
        <p className="text-xl font-bold text-primary">GH₵{item.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
