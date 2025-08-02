
'use client';

import { CheckoutForm } from '@/app/checkout/CheckoutForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getSettings } from '@/services/settingsService';
import type { AppSettings } from '@/types';
import { Loader2, ShoppingCart, Truck, PersonStanding } from 'lucide-react';
import { Button } from '@/components/ui/button';

function OrderSummary({ deliveryMethod, deliveryFee }: { deliveryMethod: 'delivery' | 'pickup', deliveryFee: number }) {
  const { state } = useCart();

  const subtotal = useMemo(() => state.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  ), [state.items]);

  const currentDeliveryFee = deliveryMethod === 'delivery' ? deliveryFee : 0;
  const total = subtotal + currentDeliveryFee;

  return (
    <div className="space-y-4">
        <h3 className="text-xl font-headline font-semibold">Order Summary</h3>
        <div className="space-y-4">
        {state.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} &times; GH₵{item.price.toFixed(2)}
                </p>
                </div>
            </div>
            <p className="font-medium">GH₵{(item.price * item.quantity).toFixed(2)}</p>
            </div>
        ))}
        <Separator />
        <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>GH₵{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span>GH₵{currentDeliveryFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>GH₵{total.toFixed(2)}</span>
            </div>
        </div>
        </div>
    </div>
  );
}


export function CheckoutClientPage() {
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  const router = useRouter();
  const { state } = useCart();

  useEffect(() => {
    setIsClient(true);
    const fetchSettings = async () => {
        try {
            const fetchedSettings = await getSettings();
            setSettings(fetchedSettings);
        } catch (error) {
            console.error("Failed to fetch settings on checkout page", error);
            // setSettings to a default state or handle the error appropriately
        } finally {
            setIsLoadingSettings(false);
        }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    // Redirect to menu if cart is empty after initial client load
    if (isClient && state.items.length === 0) {
      router.push('/menu');
    }
  }, [state.items, isClient, router]);

  const deliveryFee = useMemo(() => settings?.deliveryFee || 0, [settings]);

  const total = useMemo(() => {
    const subtotal = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const currentDeliveryFee = deliveryMethod === 'delivery' ? deliveryFee : 0;
    return subtotal + currentDeliveryFee;
  }, [state.items, deliveryMethod, deliveryFee]);
  
  if (!isClient || isLoadingSettings) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isClient && state.items.length === 0) {
    return (
        <div className="container py-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">Your Cart is Empty</h2>
            <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="mt-6">
                <Link href="/menu">Browse Menu</Link>
            </Button>
        </div>
    )
  }
  
  if (!settings) {
    return (
        <div className="container py-12 text-center">
            <h2 className="text-2xl font-bold">Could not load checkout</h2>
            <p className="text-muted-foreground">There was an error loading the page. Please try again later.</p>
        </div>
    ); 
  }

  return (
    <>
        <OrderSummary deliveryMethod={deliveryMethod} deliveryFee={deliveryFee} />
        
        <Separator />

        <div>
            <h3 className="text-xl font-headline font-semibold mb-4">Delivery Option</h3>
            <RadioGroup defaultValue="delivery" value={deliveryMethod} onValueChange={(value: 'delivery' | 'pickup') => setDeliveryMethod(value)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Label htmlFor="delivery" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                    <RadioGroupItem value="delivery" id="delivery" className="sr-only"/>
                    <Truck className="mb-3 h-6 w-6" />
                    Delivery (GH₵{deliveryFee.toFixed(2)})
                </Label>
                <Label htmlFor="pickup" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                    <RadioGroupItem value="pickup" id="pickup" className="sr-only"/>
                    <PersonStanding className="mb-3 h-6 w-6" />
                    Self Pickup (Free)
                </Label>
            </RadioGroup>
        </div>
        
        <Separator />
        
        <div>
             <h3 className="text-xl font-headline font-semibold mb-4">Your Details</h3>
            <CheckoutForm total={total} deliveryMethod={deliveryMethod} />
        </div>
    </>
  );
}
