
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartProvider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, X } from 'lucide-react';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useCart();

  const subtotal = state.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleQuantityChange = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };
  
  const handleRemoveItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Your Cart</SheetTitle>
        </SheetHeader>
        {state.items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <div className="flex flex-col gap-4 my-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        GH₵{item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="h-6 w-12 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <SheetFooter className="mt-4">
              <div className="w-full space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total (before delivery)</span>
                  <span>GH₵{subtotal.toFixed(2)}</span>
                </div>
                <SheetClose asChild>
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
