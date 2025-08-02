
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import type { FoodItem, Category } from '@/types';
import { MenuItemActions } from './MenuItemActions';
import { CategoryActions } from './CategoryActions';

interface MenuItemListProps {
    categories: Category[];
    menuItems: FoodItem[];
    onRefresh: () => void;
}

export function MenuItemList({ categories, menuItems, onRefresh }: MenuItemListProps) {
    
    if (categories.length === 0) {
        return null; // Or some placeholder if you prefer
    }
    
    return (
        <div className="space-y-8">
            {categories.map((category) => {
                const itemsInCategory = menuItems.filter((item) => item.category === category.name);
                if (itemsInCategory.length === 0) return null;

                return (
                    <Card key={category.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{category.name}</CardTitle>
                            <CategoryActions category={category} onRefresh={onRefresh} />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-16 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemsInCategory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={64}
                                                    height={64}
                                                    className="rounded-md object-cover"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>GH₵{item.price.toFixed(2)}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>
                                               <MenuItemActions item={item} categories={categories} onRefresh={onRefresh} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
