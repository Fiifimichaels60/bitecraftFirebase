
'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';
import { setAdminClaim } from '@/lib/firebase-admin-helper';

const createAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function createAdminUser(prevState: any, formData: FormData) {
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
    
    // Set custom claim to identify user as an admin
    await setAdminClaim(userRecord.uid);

    return {
      message: 'Admin user created successfully!',
      error: false,
    };
  } catch (error: any) {
    console.error('Failed to create admin user:', error);
    // Provide a more specific error message if available
    const message = error.code === 'auth/email-already-exists'
      ? 'An account with this email already exists.'
      : 'Failed to create admin user. Please check server logs.';
      
    return {
      message,
      error: true,
    };
  }
}
