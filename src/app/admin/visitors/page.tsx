
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
import { Download, Loader2, Trash2 } from 'lucide-react';
import { getVisitors } from '@/services/visitorService';
import type { Visitor } from '@/types';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csv';
import { VisitorActions } from './VisitorActions';

export default function VisitorsPage() {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchVisitors = async () => {
        setIsLoading(true);
        try {
            const fetchedVisitors = await getVisitors();
            setVisitors(fetchedVisitors);
        } catch (error) {
            console.error("Failed to fetch visitors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, []);
    
    const handleDownload = () => {
        const data = visitors.map(v => ({
            id: v.id,
            name: v.name,
            email: v.email,
            phone: v.phone,
            joinedOn: format(v.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        }));
        downloadCsv(data, 'visitors');
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Visitors</CardTitle>
            <CardDescription>A list of potential customers who started the checkout process.</CardDescription>
        </div>
        <Button onClick={handleDownload} variant="outline" size="sm" disabled={isLoading || visitors.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Loading visitors...</span>
            </div>
        ) : visitors.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date Captured</TableHead>
                        <TableHead className="w-16 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visitors.map((visitor) => (
                        <TableRow key={visitor.id}>
                            <TableCell className="font-medium">{visitor.name}</TableCell>
                            <TableCell>{visitor.email}</TableCell>
                            <TableCell>{visitor.phone}</TableCell>
                            <TableCell>{format(visitor.createdAt, 'PP')}</TableCell>
                            <TableCell>
                                <VisitorActions visitor={visitor} onRefresh={fetchVisitors} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            <p className="text-sm text-muted-foreground p-4 text-center">No visitor data found.</p>
        )}
      </CardContent>
    </Card>
  );
}
