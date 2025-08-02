
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function AnalyticsPage() {
  
  const handleDownload = () => {
    // In a real scenario, you would fetch and format your analytics data here.
    const csvContent = "data:text/csv;charset=utf-8,Page,Views,Uniques\n/home,1500,800\n/menu,1200,750\n/checkout,300,250\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card>
       <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View your app's analytics.</CardDescription>
        </div>
        <Button onClick={handleDownload} variant="outline" size="sm" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        <p>Analytics data is not available yet.</p>
      </CardContent>
    </Card>
  );
}
