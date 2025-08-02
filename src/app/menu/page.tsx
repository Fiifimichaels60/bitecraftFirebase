
'use client';

import { FoodCard } from '@/components/FoodCard';
import { FoodListItem } from '@/components/FoodListItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategories } from '@/services/categoryService';
import { getMenuItems } from '@/services/menuService';
import type { FoodItem, Category } from '@/types';
import { LayoutGrid, List, Loader2, Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PromotionSuggestor } from '@/components/PromotionSuggestor';
import { Separator } from '@/components/ui/separator';

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
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
            title: 'Error',
            description: 'Could not load the menu. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMenuItems = useMemo(() => {
    let items = menuItems;

    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeCategory) {
      items = items.filter(item => item.category === activeCategory);
    }
    
    return items;
  }, [menuItems, searchQuery, activeCategory]);


  if (isLoading) {
    return (
        <div className="container py-12 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="mr-2 h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading our delicious menu...</p>
        </div>
    )
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">Discover Our Menu</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          From savory classics to delightful new flavors, every dish is crafted with passion.
        </p>
      </div>
      
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-sm -mx-4 px-4 py-4 mb-8 border-b">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search for food..."
                    className="w-full pl-10 h-11 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="h-5 w-5" />
                    <span className="sr-only">Grid View</span>
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                    <List className="h-5 w-5" />
                    <span className="sr-only">List View</span>
                </Button>
            </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            onClick={() => setActiveCategory(null)}
            className="rounded-full"
        >
            All Items
        </Button>
        {categories.map((category) => (
            <Button
                key={category.id}
                variant={activeCategory === category.name ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category.name)}
                className="rounded-full"
            >
                {category.name}
            </Button>
        ))}
      </div>


      {filteredMenuItems.length > 0 ? (
        viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredMenuItems.map((item) => (
                <FoodCard key={item.id} item={item} />
                ))}
            </div>
        ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
                {filteredMenuItems.map((item) => (
                    <FoodListItem key={item.id} item={item} />
                ))}
            </div>
        )
      ) : (
          <div className="text-center py-16">
            <p className="text-lg font-semibold">No Dishes Found</p>
            <p className="text-muted-foreground mt-2">
                {searchQuery ? `We couldn't find any items matching "${searchQuery}".` : `There are no items in this category yet.`}
            </p>
          </div>
      )}
      
      <Separator className="my-16" />

      <PromotionSuggestor />
    </div>
  );
}
