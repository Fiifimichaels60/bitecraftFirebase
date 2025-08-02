
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
import { Loader2, Download } from 'lucide-react';
import { getPayments } from '@/services/paymentService';
import type { Payment } from '@/types';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csv';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            setIsLoading(true);
            try {
                const fetchedPayments = await getPayments();
                setPayments(fetchedPayments.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
            } catch (error) {
                console.error("Failed to fetch payments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const getStatusVariant = (status: Payment['status']) => {
        switch (status) {
            case 'Succeeded': return 'default';
            case 'Failed': return 'destructive';
            default: return 'outline';
        }
    }
    
    const handleDownload = () => {
        const data = payments.map(p => ({
            paymentId: p.id,
            orderId: p.orderId,
            date: format(p.createdAt, 'yyyy-MM-dd HH:mm:ss'),
            status: p.status,
            gateway: p.gateway,
            amount: p.amount.toFixed(2),
        }));
        downloadCsv(data, 'payments');
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>View your payment history.</CardDescription>
        </div>
        <Button onClick={handleDownload} variant="outline" size="sm" disabled={isLoading || payments.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Loading payments...</span>
            </div>
        ) : payments.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Gateway</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell className="font-mono text-xs">{payment.orderId}</TableCell>
                            <TableCell>{format(payment.createdAt, 'PPpp')}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(payment.status)}>{payment.status}</Badge>
                            </TableCell>
                            <TableCell>{payment.gateway}</TableCell>
                            <TableCell className="text-right">GH₵{payment.amount.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            <p className="text-sm text-muted-foreground p-4 text-center">No payments found.</p>
        )}
      </CardContent>
    </Card>
  );
}
