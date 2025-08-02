
'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
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
import { getPayments } from '@/services/paymentService';
import { getOrders } from '@/services/orderService';
import { getCustomers } from '@/services/customerService';
import { getMenuItems } from '@/services/menuService';
import type { Order, TopSellingItem } from '@/types';
import { Loader2, Utensils } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalMenuItems, setTotalMenuItems] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [payments, orders, customers, menuItems] = await Promise.all([
          getPayments(),
          getOrders(),
          getCustomers(),
          getMenuItems(),
        ]);

        const revenue = payments
          .filter(p => p.status === 'Succeeded')
          .reduce((sum, p) => sum + p.amount, 0);
        setTotalRevenue(revenue);
        setTotalOrders(orders.length);
        setTotalCustomers(customers.length);
        setTotalMenuItems(menuItems.length);
        
        setRecentOrders(orders.slice(0, 5));

        const itemCounts: { [key: string]: number } = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
          });
        });

        const sortedItems = Object.entries(itemCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        setTopSellingItems(sortedItems);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Loading dashboard...</span>
        </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
       <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`GH₵${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="Total from successful payments"
        />
        <StatCard
          title="Total Orders"
          value={`${totalOrders}`}
          icon={ShoppingBag}
          description="Total orders placed"
        />
        <StatCard
          title="Active Customers"
          value={`${totalCustomers}`}
          icon={Users}
          description="Total unique customers"
        />
        <StatCard
          title="Menu Items"
          value={`${totalMenuItems}`}
          icon={Package}
          description="Total items available"
        />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {recentOrders.map(order => (
                          <TableRow key={order.id}>
                              <TableCell>
                                  <div className="font-medium">{order.customerDetails?.name ?? 'N/A'}</div>
                                  <div className="text-sm text-muted-foreground">{order.customerDetails?.email ?? 'N/A'}</div>
                              </TableCell>
                              <TableCell>
                                  <Badge variant={order.status === 'Completed' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                                      {order.status}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">GH₵{order.total.toFixed(2)}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent orders to display.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>
              The most popular items across all orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topSellingItems.length > 0 ? (
                <div className="space-y-4">
                  {topSellingItems.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <Utensils className="h-4 w-4 text-muted-foreground mr-4"/>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">
                          {item.name}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">{item.count} sold</div>
                    </div>
                  ))}
                </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not enough data to show top sellers.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
