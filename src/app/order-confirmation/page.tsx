import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  return (
    <div className="container flex items-center justify-center py-24">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline mt-4">Order Successful!</CardTitle>
          <CardDescription>
            Thank you for choosing Bite Craft.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your order has been placed and is now being processed. You will receive an email and SMS confirmation shortly with your order details.
          </p>
          <Button asChild size="lg">
            <Link href="/menu">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
