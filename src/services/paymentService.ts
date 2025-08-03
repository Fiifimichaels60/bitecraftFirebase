
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, updateDoc } from 'firebase/firestore';
import type { Payment } from '@/types';

const paymentsCollection = collection(db, 'payments');

export async function getPayments(): Promise<Payment[]> {
    const snapshot = await getDocs(paymentsCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
                ? data.createdAt.toDate()
                : data.createdAt ?? null,
        } as Payment;
    });
}

export async function createPayment(orderId: string, amount: number, status: Payment['status'], gateway: Payment['gateway']): Promise<string> {
    const docRef = await addDoc(paymentsCollection, {
        orderId,
        amount,
        status,
        gateway,
        transactionId: null,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updatePaymentStatusByOrderId(orderId: string, status: Payment['status'], transactionId?: string): Promise<void> {
    const q = query(paymentsCollection, where("orderId", "==", orderId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.error(`Payment record not found for orderId: ${orderId}`);
        return;
    }

    const paymentDoc = querySnapshot.docs[0];
    const updateData: { status: Payment['status'], transactionId?: string } = { status };
    if (transactionId) {
        updateData.transactionId = transactionId;
    }

    await updateDoc(paymentDoc.ref, updateData);
}
