
'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';
import { updateUserEmail, updateUserPassword, updateUserProfilePicture as updateUserPfp } from '@/lib/firebase-admin-helper';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/services/activityLogService';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
});

const profileSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    currentEmail: z.string().email(),
});

const profilePictureSchema = z.object({
    profilePicture: z.instanceof(File).refine(file => file.size > 0, 'A file is required.'),
})


async function getUserIdFromSession(sessionCookie: string | undefined | null) {
    if (!sessionCookie) {
        return null;
    }
    if (!adminApp) {
        console.error("Firebase Admin SDK not initialized. Cannot verify session token.");
        return null;
    }
    try {
        const decodedToken = await getAuth(adminApp).verifyIdToken(sessionCookie);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying session token:", error);
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


export async function updateProfile(prevState: any, formData: FormData) {
    const adminUser = await getAuthenticatedAdmin();
    if (!adminUser) {
        return { message: 'Authentication required.', error: true };
    }
    const { uid, email: adminEmail } = adminUser;

    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = profileSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { message: 'Invalid form data provided.', error: true };
    }
    
    const { email, currentEmail } = validatedFields.data;

    if (email === currentEmail) {
        return { message: 'No changes were submitted.', error: false };
    }

    try {
        await updateUserEmail(uid, email);
        await logActivity('admin_action', `Admin updated their email.`, { adminEmail });
        
        revalidatePath('/admin/profile');
        revalidatePath('/admin');
        
        return { message: 'Profile updated successfully!', error: false };
    } catch (error: any) {
        console.error('Failed to update profile:', error);
        return { message: error.message || 'An unknown error occurred.', error: true };
    }
}

export async function updateProfilePicture(formData: FormData, sessionToken: string) {
    const uid = await getUserIdFromSession(sessionToken);
    if (!uid) {
        return { message: 'Authentication required.', error: true };
    }
    
    const validatedFields = profilePictureSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Invalid file provided.', error: true };
    }

    const { profilePicture } = validatedFields.data;

    try {
        const user = await getAuth(adminApp).getUser(uid);
        await updateUserPfp(uid, profilePicture);
        await logActivity('admin_action', 'Admin updated their profile picture.', { adminEmail: user.email });

        revalidatePath('/admin/profile', 'layout');
        
        return { message: 'Profile picture updated successfully!', error: false };

    } catch (error: any) {
        console.error('Failed to update profile picture:', error);
        return { message: error.message || 'An unknown error occurred.', error: true };
    }
}


export async function updatePassword(prevState: any, formData: FormData) {
    const adminUser = await getAuthenticatedAdmin();
    if (!adminUser) {
      return { message: 'Authentication required.', error: true };
    }
    const { uid, email: adminEmail } = adminUser;

    try {
        const rawData = Object.fromEntries(formData.entries());
        const validatedFields = passwordSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return { message: 'Invalid password provided.', error: true };
        }

        await updateUserPassword(uid, validatedFields.data.newPassword);
        await logActivity('admin_action', 'Admin updated their password.', { adminEmail });
        
        return { message: 'Password updated successfully.', error: false };
    } catch (error: any) {
        console.error('Failed to update password:', error);
        return { message: error.message || 'An unknown error occurred.', error: true };
    }
}
