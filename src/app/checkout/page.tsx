
'use client';

import { CheckoutClientPage } from './CheckoutClientPage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CheckoutPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Checkout</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Almost there! Please provide your details to complete your order.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Your Order</CardTitle>
            <CardDescription>
              Review your items and provide your details to complete the
              purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <CheckoutClientPage />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
