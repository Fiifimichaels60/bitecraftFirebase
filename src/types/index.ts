
export type FoodItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  'data-ai-hint'?: string;
};

export type CartItem = FoodItem & {
  quantity: number;
};

export type Category = {
    id: string;
    name: string;
};

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    createdAt: Date;
}

export type Order = {
    id:string;
    customerId: string;
    items: CartItem[];
    total: number;
    subtotal: number;
    deliveryFee: number;
    status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
    deliveryMethod: 'delivery' | 'pickup';
    createdAt: Date;
    channel: string;
    customerDetails?: {
        name: string;
        email: string;
    }
}

export type Payment = {
    id: string;
    orderId: string;
    amount: number;
    status: 'Succeeded' | 'Failed' | 'Pending';
    gateway: 'Hubtel';
    transactionId?: string;
    createdAt: Date;
}


export interface TopSellingItem {
    name: string;
    count: number;
}

export interface AppSettings {
    deliveryFee: number;
    primaryColor: string;
    accentColor: string;
    hubtelClientId: string;
    hubtelClientSecret: string;
    merchantAccountNumber: string;
    sidebarColor: string;
    sidebarAccentColor: string;
    sidebarPosition: 'left' | 'right';
    theme: 'light' | 'dark' | 'system';
}

export type ActivityLog = {
    id: string;
    action: 'admin_action' | 'page_view';
    description: string;
    createdAt: Date;
    details?: Record<string, any>;
};

export type Visitor = {
    id: string;
    name: string;
    phone: string; // The normalized phone number
    email: string;
    createdAt: Date;
};

export type Message = {
    id: string;
    name: string;
    phone: string;
    location: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export type Rating = {
    id: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}
