
'use client';

import Link from 'next/link';
import {
  Activity,
  CreditCard,
  LayoutDashboard,
  LineChart,
  LogOut,
  Package,
  ShoppingBag,
  Users,
  Utensils,
  Settings,
  Menu,
  User as UserIcon,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getSettings } from '@/services/settingsService';
import type { AppSettings } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';


function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <AdminNav />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Optional: Add search bar or other header content here */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
              <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>App Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/menu-items', label: 'Menu Items', icon: Package },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/visitors', label: 'Visitors', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/activity-logs', label: 'Activity Logs', icon: Activity },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
       <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary mb-4"
        >
          <Utensils className="h-6 w-6" />
          <span>Bite Craft</span>
        </Link>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === item.href && 'text-primary bg-muted'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopSidebar() {
    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Utensils className="h-6 w-6" />
                        <span className="">Bite Craft</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <AdminNav />
                </div>
                 <div className="mt-auto p-4">
                    {/* User info can go here if needed */}
                </div>
            </div>
        </div>
    )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    const applyAdminSettings = async () => {
      try {
        const appSettings = await getSettings();
        if (appSettings.theme) {
            setTheme(appSettings.theme);
        }
        if (appSettings.primaryColor) {
            document.documentElement.style.setProperty('--primary', appSettings.primaryColor);
        }
        if (appSettings.accentColor) {
            document.documentElement.style.setProperty('--accent', appSettings.accentColor);
        }
        if (appSettings.sidebarColor) {
            document.documentElement.style.setProperty('--sidebar-background', appSettings.sidebarColor);
        }
        if (appSettings.sidebarAccentColor) {
            document.documentElement.style.setProperty('--sidebar-primary', appSettings.sidebarAccentColor);
            document.documentElement.style.setProperty('--sidebar-ring', appSettings.sidebarAccentColor);
        }
      } catch (error) {
        console.error("Could not apply theme settings for admin", error)
      }
    };
    applyAdminSettings();
  }, [setTheme]);


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DesktopSidebar />
        <div className="flex flex-col">
            <AdminHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                {children}
            </main>
        </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/admin/login');
    }
    if (!loading && user && isLoginPage) {
        router.push('/admin');
    }
  }, [user, loading, router, pathname, isLoginPage]);

  if (loading || (!user && !isLoginPage)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (isLoginPage) {
    return <>{children}</>
  }
  
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
