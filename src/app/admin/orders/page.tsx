
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Truck, PersonStanding, Download } from 'lucide-react';
import { getOrders } from '@/services/orderService';
import type { Order } from '@/types';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csv';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const fetchedOrders = await getOrders();
                setOrders(fetchedOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Completed': return 'default';
            case 'Processing': return 'secondary';
            case 'Cancelled': return 'destructive';
            default: 'outline';
        }
    }
    
    const handleDownload = () => {
        const data = orders.map(o => ({
            orderId: o.id,
            customerName: o.customerDetails?.name || 'N/A',
            customerEmail: o.customerDetails?.email || o.customerId,
            date: format(o.createdAt, 'yyyy-MM-dd HH:mm:ss'),
            status: o.status,
            deliveryMethod: o.deliveryMethod,
            total: o.total.toFixed(2),
            subtotal: o.subtotal.toFixed(2),
            deliveryFee: o.deliveryFee.toFixed(2),
            items: o.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
        }));
        downloadCsv(data, 'orders');
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage your restaurant's orders here.</CardDescription>
        </div>
         <Button onClick={handleDownload} variant="outline" size="sm" disabled={isLoading || orders.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Loading orders...</span>
            </div>
        ) : orders.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">{order.customerDetails?.name ?? 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">{order.customerDetails?.email ?? order.customerId}</div>
                            </TableCell>
                            <TableCell>{format(order.createdAt, 'PPpp')}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {order.deliveryMethod === 'delivery' ? <Truck className="h-4 w-4 text-muted-foreground" /> : <PersonStanding className="h-4 w-4 text-muted-foreground" />}
                                    <span>{order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">GH₵{order.total.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
             <p className="text-sm text-muted-foreground p-4 text-center">No orders found.</p>
        )}
      </CardContent>
    </Card>
  );
}
