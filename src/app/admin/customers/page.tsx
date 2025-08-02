
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
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { getCustomers } from '@/services/customerService';
import type { Customer } from '@/types';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csv';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true);
            try {
                const fetchedCustomers = await getCustomers();
                setCustomers(fetchedCustomers.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, []);
    
    const handleDownload = () => {
        const data = customers.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            location: c.location,
            joinedOn: format(c.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        }));
        downloadCsv(data, 'customers');
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>View and manage your customers.</CardDescription>
        </div>
        <Button onClick={handleDownload} variant="outline" size="sm" disabled={isLoading || customers.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Loading customers...</span>
            </div>
        ) : customers.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.location}</TableCell>
                            <TableCell>{format(customer.createdAt, 'PP')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            <p className="text-sm text-muted-foreground p-4 text-center">No customers found.</p>
        )}
      </CardContent>
    </Card>
  );
}
