
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from './ProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { ProfilePictureForm } from './ProfilePictureForm';


export default function ProfilePage() {

  return (
    <>
      <div className="mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal account settings.
          </p>
      </div>
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your email address.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileForm />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile picture.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProfilePictureForm />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Set a new password for your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChangePasswordForm />
            </CardContent>
        </Card>
      </div>
    </>
  );
}
