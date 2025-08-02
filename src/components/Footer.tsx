import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center space-x-2 mb-2">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold font-headline">Bite Craft</span>
                </div>
                <p className="text-muted-foreground text-sm text-center md:text-left">Delicious food delivered to your doorstep.</p>
            </div>
            <div className="flex flex-col items-center">
                <h3 className="font-semibold mb-2">Quick Links</h3>
                <nav className="flex flex-col gap-1 text-sm text-center">
                    <Link href="/menu" className="text-muted-foreground hover:text-primary">
                    Menu
                    </Link>
                    <Link href="/contact" className="text-muted-foreground hover:text-primary">
                    Contact
                    </Link>
                </nav>
            </div>
            <div className="flex flex-col items-center md:items-end">
                <h3 className="font-semibold mb-2">Legal</h3>
                <nav className="flex flex-col gap-1 text-sm text-center md:text-right">
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                    </Link>
                </nav>
            </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bite Craft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
