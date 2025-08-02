
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettingsForm } from './GeneralSettingsForm';
import { AppearanceSettingsForm } from './AppearanceSettingsForm';
import { PaymentSettingsForm } from './PaymentSettingsForm';
import { CreateAdminForm } from './CreateAdminForm';

export default function SettingsPage() {
  return (
    <>
      <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application's settings.
          </p>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general application settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <GeneralSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AppearanceSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway</CardTitle>
              <CardDescription>
                Configure your payment gateway settings for Hubtel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <PaymentSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                        Create and manage administrator accounts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateAdminForm />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
