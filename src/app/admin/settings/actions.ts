
'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';
import { setAdminClaim } from '@/lib/firebase-admin-helper';
import { logActivity } from '@/services/activityLogService';

const createAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

async function getUserIdFromSession(sessionCookie: string | undefined | null) {
    if (!sessionCookie) return null;
    if (!adminApp) return null;
    try {
        const decodedToken = await getAuth(adminApp).verifyIdToken(sessionCookie);
        return decodedToken.uid;
    } catch (error) {
        return null;
    }
}

async function getAuthenticatedAdmin() {
    const sessionCookie = require('next/headers').headers().get('x-session');
    const uid = await getUserIdFromSession(sessionCookie);
    if (!uid) return null;

    try {
        const user = await getAuth(adminApp).getUser(uid);
        return { uid, email: user.email };
    } catch (error) {
        return null;
    }
}

export async function createAdminUser(prevState: any, formData: FormData) {
  const adminUser = await getAuthenticatedAdmin();
  if (!adminUser) {
    return { message: 'Authentication required to perform this action.', error: true };
  }
  const { email: adminEmail } = adminUser;

  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = createAdminSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        message: 'Invalid form data provided.',
        error: true,
      };
    }

    const { email, password } = validatedFields.data;

    const auth = getAuth(adminApp);
    const userRecord = await auth.createUser({
      email,
      password,
    });
    
    await setAdminClaim(userRecord.uid);
    await logActivity('admin_action', `Created new admin user: ${email}`, { adminEmail });


    return {
      message: 'Admin user created successfully!',
      error: false,
    };
  } catch (error: any) {
    console.error('Failed to create admin user:', error);
    const message = error.code === 'auth/email-already-exists'
      ? 'An account with this email already exists.'
      : 'Failed to create admin user. Please check server logs.';
      
    return {
      message,
      error: true,
    };
  }
}
