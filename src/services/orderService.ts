
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import type { Order, CartItem, Customer } from '@/types';
import { logActivity } from './activityLogService';

const ordersCollection = collection(db, 'orders');

export async function getOrders(): Promise<Order[]> {
    const snapshot = await getDocs(ordersCollection);
    const orders = await Promise.all(snapshot.docs.map(async (d) => {
      const data = d.data();
      const order: Order = {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as Order;

      // Fetch customer details
      if (order.customerId) {
        try {
            const customerRef = doc(db, 'customers', order.customerId);
            const customerSnap = await getDoc(customerRef);
            if (customerSnap.exists()) {
              const customerData = customerSnap.data() as Omit<Customer, 'id'>;
              order.customerDetails = {
                name: customerData.name,
                email: customerData.email,
              };
            }
        } catch (e) {
            console.error(`Could not fetch customer ${order.customerId}`, e)
        }
      }
      return order;
    }));
    return orders;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'customerDetails'>): Promise<string> {
    const docRef = await addDoc(ordersCollection, {
        ...orderData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, { status });
    await logActivity('admin_action', `Order ${orderId} status updated to ${status} via webhook.`);
}
