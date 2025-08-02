
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp, DocumentData } from 'firebase/firestore';
import type { Customer } from '@/types';

const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersCollection);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate(),
    } as Customer
  });
}

export async function findOrCreateCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<string> {
    const q = query(customersCollection, where("email", "==", customerData.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Customer exists
        return querySnapshot.docs[0].id;
    } else {
        // Create new customer
        const docRef = await addDoc(customersCollection, {
            ...customerData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    }
}
