"use client";

import { useState, useEffect } from "react";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "#/server/actions/notification";
import { Button } from "#/components/ui/button";
import { Switch } from "#/components/ui/switch";
import { toast } from "sonner";
import { useConvex } from "convex/react";
import { api } from "#/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationManagerProps {
  userId?: string; // Optional as user may not be logged in
  compact?: boolean; // For a more compact version in the navbar
}

function PushNotificationManager({ userId, compact = false }: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const savePreferences = useMutation(api.notifications.saveNotificationPreferences);
  const userPrefs = useQuery(api.notifications.getNotificationPreferences, 
    userId ? { userId: userId as any } : "skip");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      void registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }

  async function subscribeToPush(): Promise<void> {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });
      
      setSubscription(sub);
      const serializedSub = JSON.stringify(sub);
      
      await subscribeUser(serializedSub);
      
      // Save to Convex if user is logged in
      if (userId) {
        await savePreferences({
          userId: userId as any,
          enabledChannels: userPrefs?.enabledChannels || ["push"],
          disabledTypes: userPrefs?.disabledTypes || [],
          pushSubscription: serializedSub,
        });
      }
      
      toast.success("Push notifications enabled");
    } catch (error) {
      console.error("Push subscription failed:", error);
      toast.error("Failed to enable push notifications");
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush(): Promise<void> {
    setIsLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        await unsubscribeUser();
        
        // Update Convex if user is logged in
        if (userId && userPrefs) {
          const channels = userPrefs.enabledChannels.filter(c => c !== "push");
          await savePreferences({
            userId: userId as any,
            enabledChannels: channels,
            disabledTypes: userPrefs.disabledTypes,
            pushSubscription: undefined,
          });
        }
        
        toast.success("Push notifications disabled");
      }
    } catch (error) {
      console.error("Push unsubscription failed:", error);
      toast.error("Failed to disable push notifications");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return compact ? null : (
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-lg font-medium">Push Notifications</h3>
        <p className="text-muted-foreground">Push notifications are not supported in this browser.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between w-full p-3 border-b">
        <div className="flex flex-col">
          <p className="font-medium">Push Notifications</p>
          <p className="text-muted-foreground text-sm">
            {subscription ? "Enabled" : "Disabled"}
          </p>
        </div>
        <Switch
          checked={!!subscription}
          onCheckedChange={(checked) => {
            if (checked) {
              void subscribeToPush();
            } else {
              void unsubscribeFromPush();
            }
          }}
          disabled={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-medium">Push Notifications</h3>
      {subscription ? (
        <div className="space-y-4">
          <p className="text-sm">You are currently receiving push notifications.</p>
          <Button 
            variant="outline" 
            onClick={() => void unsubscribeFromPush()} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Disabling..." : "Disable Push Notifications"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Enable push notifications to stay updated on transactions and activity.</p>
          <Button 
            onClick={() => void subscribeToPush()} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Enabling..." : "Enable Push Notifications"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default PushNotificationManager;