
import type { FoodItem, Category } from '@/types';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

export let initialFoodCategories = ['Pizza', 'Burgers', 'Salads', 'Drinks'];

export let initialFoodItems: Omit<FoodItem, 'id'>[] = [
  {
    name: 'Margherita Pizza',
    description: 'Classic cheese and tomato pizza.',
    price: 12.99,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'margherita pizza',
    category: 'Pizza',
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Pizza with spicy pepperoni slices.',
    price: 14.99,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'pepperoni pizza',
    category: 'Pizza',
  },
  {
    name: 'Veggie Supreme Pizza',
    description: 'Loaded with fresh vegetables.',
    price: 15.99,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'veggie pizza',
    category: 'Pizza',
  },
  {
    name: 'Classic Beef Burger',
    description: 'A juicy beef patty with lettuce, tomato, and cheese.',
    price: 9.99,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'beef burger',
    category: 'Burgers',
  },
  {
    name: 'Chicken Burger',
    description: 'Crispy chicken fillet in a soft bun.',
    price: 8.99,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'chicken burger',
    category: 'Burgers',
  },
  {
    name: 'Veggie Burger',
    description: 'A delicious plant-based patty.',
    price: 8.49,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'veggie burger',
    category: 'Burgers',
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine with Caesar dressing, croutons, and parmesan.',
    price: 7.99,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'caesar salad',
    category: 'Salads',
  },
  {
    name: 'Greek Salad',
    description: 'Tomatoes, cucumbers, olives, and feta cheese.',
    price: 8.99,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'greek salad',
    category: 'Salads',
  },
  {
    name: 'Cola',
    description: 'Refreshing classic cola.',
    price: 1.99,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'cola can',
    category: 'Drinks',
  },
  {
    name: 'Mineral Water',
    description: 'Pure and simple.',
    price: 1.49,
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'water bottle',
    category: 'Drinks',
  },
];

export async function seedDatabase() {
    const categoriesCollectionRef = collection(db, 'categories');
    const menuItemsCollectionRef = collection(db, 'menuItems');

    try {
        const categoriesSnapshot = await getDocs(categoriesCollectionRef);
        const menuItemsSnapshot = await getDocs(menuItemsCollectionRef);

        if (categoriesSnapshot.empty && menuItemsSnapshot.empty) {
            console.log('Database is empty. Seeding initial data...');
            const batch = writeBatch(db);

            // Seed categories
            const categoryNameToIdMap = new Map<string, string>();
            initialFoodCategories.forEach(categoryName => {
                const categoryDocRef = doc(categoriesCollectionRef);
                batch.set(categoryDocRef, { name: categoryName });
                categoryNameToIdMap.set(categoryName, categoryDocRef.id);
            });

            // Seed menu items
            initialFoodItems.forEach(item => {
                const itemDocRef = doc(menuItemsCollectionRef);
                batch.set(itemDocRef, item);
            });

            await batch.commit();
            console.log('Database seeded successfully.');
            return true;
        } else {
            console.log('Database already contains data. Skipping seed.');
            return false;
        }
    } catch (error) {
        console.error("Error seeding database:", error);
        // This might happen if the rules are not set correctly yet.
        // We'll ignore it for now and let the app try to function.
        return false;
    }
}
