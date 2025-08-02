
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
import { Loader2, User, Terminal } from 'lucide-react';
import { getActivityLogs } from '@/services/activityLogService';
import type { ActivityLog } from '@/types';
import { format } from 'date-fns';

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const fetchedLogs = await getActivityLogs(100); // Fetch last 100 logs
                setLogs(fetchedLogs);
            } catch (error) {
                console.error("Failed to fetch activity logs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getActionVariant = (action: ActivityLog['action']) => {
        switch (action) {
            case 'admin_action': return 'destructive';
            case 'page_view': return 'secondary';
            default: return 'outline';
        }
    }
    
    const getActionIcon = (action: ActivityLog['action']) => {
        switch (action) {
            case 'admin_action': return <Terminal className="h-4 w-4" />;
            case 'page_view': return <User className="h-4 w-4" />;
            default: return null;
        }
    }
    
    const getActorInfo = (log: ActivityLog) => {
        if (log.action === 'admin_action') {
            return log.details?.adminEmail || 'N/A';
        }
        if (log.action === 'page_view') {
            return log.details?.ip || 'N/A';
        }
        return 'System';
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
        <CardDescription>
            An overview of recent activities in your application.
            Logs are automatically deleted after 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Loading logs...</span>
            </div>
        ) : logs.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right w-[200px]">Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>
                                <Badge variant={getActionVariant(log.action)} className="gap-1">
                                    {getActionIcon(log.action)}
                                    {log.action === 'admin_action' ? 'Admin' : 'Visitor'}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{getActorInfo(log)}</TableCell>
                            <TableCell className="font-medium">{log.description}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{format(log.createdAt, 'PPpp')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            <p className="text-sm text-muted-foreground p-4 text-center">No activity found.</p>
        )}
      </CardContent>
    </Card>
  );
}
