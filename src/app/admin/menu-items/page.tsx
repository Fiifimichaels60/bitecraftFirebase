
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2, Search, Download } from 'lucide-react';
import { CategoryForm } from './CategoryForm';
import { MenuItemForm } from './MenuItemForm';
import { MenuItemList } from './MenuItemList';
import { getCategories } from '@/services/categoryService';
import { getMenuItems } from '@/services/menuService';
import type { FoodItem, Category } from '@/types';
import { toast } from '@/hooks/use-toast';
import { downloadCsv } from '@/lib/csv';

export default function MenuItemsPage() {
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isItemOpen, setItemOpen] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedCategories, fetchedMenuItems] = await Promise.all([
        getCategories(),
        getMenuItems(),
      ]);
      setCategories(fetchedCategories);
      setMenuItems(fetchedMenuItems);
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Data',
        description: 'Could not connect to the database. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    setCategoryOpen(false);
    setItemOpen(false);
    fetchData(); // Refetch data after successful submission
  };

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
  }, [menuItems, searchQuery, categoryFilter]);

  const filteredCategories = useMemo(() => {
    if (categoryFilter === 'all' && searchQuery === '') return categories;
    
    const relevantCategories = new Set(filteredMenuItems.map(item => item.category));
    return categories.filter(category => relevantCategories.has(category.name));

  }, [categories, filteredMenuItems, categoryFilter, searchQuery]);
  
  const handleDownload = () => {
    const dataToExport = filteredMenuItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description || '',
    }));
    downloadCsv(dataToExport, 'menu_items');
  }

  return (
    <>
      <div className="flex justify-between items-start md:items-center mb-6 flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Manage your restaurant's categories and menu items.
          </p>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleDownload} variant="outline" disabled={isLoading || filteredMenuItems.length === 0}>
              <Download className="mr-2" />
              Download CSV
          </Button>
          <Dialog open={isCategoryOpen} onOpenChange={setCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
          <Dialog open={isItemOpen} onOpenChange={setItemOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Menu Item</DialogTitle>
              </DialogHeader>
              <MenuItemForm categories={categories} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine your view of the menu items.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by food name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={category.name}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Loading menu...</span>
          </div>
      ) : filteredMenuItems.length > 0 ? (
          <MenuItemList categories={filteredCategories} menuItems={filteredMenuItems} onRefresh={fetchData} />
      ) : (
        <div className="text-center py-16 rounded-lg border border-dashed">
            <h3 className="text-xl font-semibold">No Menu Items Found</h3>
            <p className="text-muted-foreground mt-2">
                Your search for "{searchQuery}" in {categoryFilter === 'all' ? 'all categories' : `the "${categoryFilter}" category`} did not return any results.
            </p>
        </div>
      )}
    </>
  );
}
