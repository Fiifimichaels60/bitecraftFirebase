
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogOut, ShoppingBag, UtensilsCrossed, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartSheet } from '@/components/CartSheet';
import { useCart } from '@/contexts/CartProvider';
import { useAuth } from '@/contexts/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

export function Header() {
  const { state } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }
  
  const isAdminPage = pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return null; // Don't render the main header on admin pages
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block">
            Bite Craft
          </span>
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
            <Link
                href="/menu"
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === '/menu' ? 'text-primary' : 'text-foreground/60'
                )}
            >
                Menu
            </Link>
            <Link
                href="/contact"
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === '/contact' ? 'text-primary' : 'text-foreground/60'
                )}
            >
                Contact
            </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <CartSheet>
              <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {itemCount}
                  </span>
              )}
              <span className="sr-only">Open cart</span>
              </Button>
          </CartSheet>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin')}>
                  <UtensilsCrossed className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle main menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  <SheetClose asChild>
                    <Link
                        href="/menu"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Menu
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/contact"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Contact
                    </Link>
                  </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
