
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FoodCard } from '@/components/FoodCard';
import { getMenuItems } from '@/services/menuService';
import type { FoodItem } from '@/types';
import { useEffect, useState } from 'react';
import { ArrowRight, Utensils, ChefHat, Truck } from 'lucide-react';
import restaurantBG from './restaurantBG.jpg';
import { PromotionSuggestor } from '@/components/PromotionSuggestor';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await getMenuItems();
        // Shuffle the items and take the first 3 for a random featured list
        const randomItems = items.sort(() => 0.5 - Math.random()).slice(0, 3);
        setFeaturedItems(randomItems); 
      } catch (error) {
        console.error("Failed to fetch featured items", error);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[75vh] min-h-[400px] text-white">
        <Image
          src={restaurantBG}
          alt="An elegant outdoor dinner setting at night with warm lights"
          fill
          className="object-cover"
          placeholder="blur"
          data-ai-hint="elegant dinner"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold font-headline mb-4 drop-shadow-lg leading-tight">
            Crave. Click. Enjoy.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 drop-shadow-md">
            Your favorite meals from Bite Craft, delivered fast to your door.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-7 px-10 rounded-full group">
            <Link href="/menu">
              Order Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
      
      <section className="py-16 lg:py-24 bg-background">
        <div className="container grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Utensils className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Quality Ingredients</h3>
                <p className="text-muted-foreground">Only the freshest, locally-sourced ingredients make it to our kitchen.</p>
            </div>
            <div className="flex flex-col items-center">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Expert Chefs</h3>
                <p className="text-muted-foreground">Our experienced chefs craft each dish with passion and precision.</p>
            </div>
            <div className="flex flex-col items-center">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Fast Delivery</h3>
                <p className="text-muted-foreground">Enjoy your favorite meals hot and fresh, right at your doorstep.</p>
            </div>
        </div>
      </section>

      <section id="featured" className="py-16 lg:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Dishes</h2>
            <p className="text-muted-foreground mt-2">Hand-picked by us, for you.</p>
          </div>
          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.map((item) => (
                <FoodCard key={item.id} item={item} />
                ))}
            </div>
            ) : (
            <div className="text-center text-muted-foreground">
                <p>Loading featured dishes...</p>
            </div>
          )}
          <div className="text-center mt-12">
             <Button asChild size="lg" variant="outline">
                <Link href="/menu">View Full Menu</Link>
            </Button>
          </div>
        </div>
      </section>

       <section className="py-16 lg:py-24 bg-background">
        <div className="container">
            <PromotionSuggestor />
        </div>
      </section>

    </div>
  );
}
