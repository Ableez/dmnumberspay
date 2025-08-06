"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  IconBellFilled,
  IconDownload,
  IconSettings,
  IconTrashFilled,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "./ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { usePathname, useRouter } from "next/navigation";
import PushNotificationManager from "#/lib/push-notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { useQuery, useMutation } from "convex/react";
import { api } from "#/convex/_generated/api";
import { Badge } from "#/components/ui/badge";
import { type Id } from "#/convex/_generated/dataModel";

// Constants for the navbar
const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/send": "Send",
  "/receive": "Receive",
  "/settings": "Settings",
  "/profile": "Profile",
  "/crypto/buy": "Buy",
  "/transactions": "Transactions",
  "/transactions(/.*)?": "Transactions",
  // ...
};

const RIGHT_ICONS: Array<{
  pattern: RegExp;
  config: { bell?: boolean; settings?: boolean };
}> = [
  { pattern: /^\/$/, config: { bell: true, settings: true } },
  { pattern: /^\/send$/, config: { bell: false } },
  { pattern: /^\/receive$/, config: { bell: true } },
  { pattern: /^\/settings$/, config: { bell: true } },
  { pattern: /^\/profile$/, config: { settings: true } },
  { pattern: /^\/crypto\/buy$/, config: { bell: true } },
  {
    pattern: /^\/transactions(\/.*)?$/,
    config: { bell: true, settings: true },
  },
];

// Routes that should show back button instead of profile avatar
const BACK_BUTTON_ROUTES = ["/account"];

const SHOW_TITLE_ROUTES: Record<
  string,
  { searchbar?: boolean; title?: string }
> = {
  "/account": { searchbar: false, title: "Manage Profile" },
  "/send": { searchbar: false, title: "Send" },
};

const MainNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  // Get user session/ID here - depends on your auth system
  useEffect(() => {
    // Example only - replace with actual method to get user ID
    const getUserId = async () => {
      // Implementation depends on your auth system
      // setUserId(fetchedId)
    };
    
    void getUserId();
  }, []);
  
  // Define queries at the component level
  const unreadNotifications = useQuery(
    api.funcs.notifications.getUserNotifications,
    userId ? { userId, status: "unread" } : "skip"
  );
  
  const allNotifications = useQuery(
    api.funcs.notifications.getUserNotifications,
    userId ? { userId } : "skip"
  );
  
  // Define mutations
  const markAllAsRead = useMutation(api.funcs.notifications.markAllNotificationsAsRead);
  const markAsRead = useMutation(api.funcs.notifications.markNotificationAsRead);
  const deleteNotification = useMutation(api.funcs.notifications.deleteNotification);

  const shouldShowBackButton = BACK_BUTTON_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const rightIcons = RIGHT_ICONS.find((item) => item.pattern.test(pathname))
    ?.config ?? {
    bell: false,
    settings: false,
  };

  const showTitle = SHOW_TITLE_ROUTES[pathname]?.title ?? false;
  const showSearchbar = SHOW_TITLE_ROUTES[pathname]?.searchbar ?? false;

  const handleBackClick = () => {
    router.back();
  };
  
  // Handle notification actions
  const handleMarkAllAsRead = async () => {
    if (userId) {
      await markAllAsRead({ userId });
    }
  };

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    await markAsRead({ notificationId });
  };

  const handleDeleteNotification = async (notificationId: Id<"notifications">) => {
    await deleteNotification({ notificationId });
  };

  const hasUnreadNotifications = unreadNotifications && 
    unreadNotifications.page.items.length > 0;

  return (
    <nav
      className={`${showTitle || showSearchbar ? "bg-gradient-to-b from-black to-black/70 backdrop-blur-md" : ""} sticky top-0 z-[999999] flex w-full items-center justify-between gap-6 p-4 px-4`}
    >
      <div className="flex items-center gap-2">
        {shouldShowBackButton ? (
          <button
            onClick={handleBackClick}
            className="flex h-11 w-11 cursor-pointer place-items-center justify-center rounded-full align-middle transition-all duration-300 ease-in-out hover:scale-[0.98] hover:bg-white/5"
          >
            <IconArrowLeft size={24} />
          </button>
        ) : (
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        )}
      </div>

      {showTitle && (
        <div
          className={
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          }
        >
          <h4 className={"text-2xl font-bold text-white"}>{showTitle}</h4>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 align-middle">
        {rightIcons.settings && (
          <Drawer>
            <DrawerTrigger asChild>
              <button className="flex aspect-square h-11 w-11 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out">
                <IconSettings size={24} />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div
                className={
                  "flex min-h-[20dvh] flex-col place-items-center justify-center p-2 align-middle"
                }
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <DrawerClose asChild>
                      <Button variant={"ghost"} className="w-full">
                        Install App
                      </Button>
                    </DrawerClose>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Install App</DialogTitle>
                      <DialogDescription>
                        Add this app to your home screen for quick access and a
                        better experience.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                          <IconDownload size={20} />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-medium">Install as PWA</p>
                          <p className="text-muted-foreground text-sm">
                            Get app-like experience with offline support
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                          <IconBellFilled size={20} />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-muted-foreground text-sm">
                            Stay updated with real-time notifications
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </DrawerContent>
          </Drawer>
        )}
        
        {rightIcons.bell && (
          <Drawer>
            <DrawerTrigger asChild>
              <div className="relative">
                <button className="flex aspect-square h-11 w-11 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out">
                  <IconBellFilled size={24} />
                </button>
                {hasUnreadNotifications && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 px-1.5 py-0.5 text-[10px]">
                    {unreadNotifications.page.items.length}
                  </Badge>
                )}
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <div className="flex flex-col h-[100vh]">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  {hasUnreadNotifications && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMarkAllAsRead()}
                      className="flex items-center gap-1 text-xs"
                    >
                      <IconCheck size={14} />
                      Mark all as read
                    </Button>
                  )}
                </div>
                
                <Tabs defaultValue="all" className="w-full">
                  <div className="px-4 pt-2">
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                      <TabsTrigger value="unread" className="flex-1">
                        Unread
                        {hasUnreadNotifications && (
                          <Badge className="ml-2 bg-red-500 px-1.5 py-0.5">
                            {unreadNotifications.page.items.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="mt-0 flex-1 overflow-y-auto">
                    <div className="h-full py-2">
                      <PushNotificationManager userId={userId ?? undefined} compact />
                      
                      {!userId ? (
                        <div className="flex h-32 items-center justify-center">
                          <p className="text-muted-foreground">Please sign in to view notifications</p>
                        </div>
                      ) : !allNotifications ? (
                        <div className="flex h-32 items-center justify-center">
                          <p className="text-muted-foreground">Loading notifications...</p>
                        </div>
                      ) : allNotifications.page.items.length === 0 ? (
                        <div className="flex h-32 items-center justify-center">
                          <p className="text-muted-foreground">No notifications found</p>
                        </div>
                      ) : (
                        // Display notifications if we have them
                        allNotifications.page.items.map((notification) => (
                          <div
                            key={notification._id}
                            className="flex items-center justify-between gap-2 p-4 border-b"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>NP</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col gap-1">
                                <h3 className="font-semibold">{notification.title}</h3>
                                <p className="text-muted-foreground text-sm">
                                  {notification.message}
                                </p>
                                <time className="text-xs text-gray-400">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </time>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="flex aspect-square h-9 w-9 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out hover:bg-white/20"
                                onClick={() => handleMarkAsRead(notification._id)}
                              >
                                <IconCheck size={18} />
                              </button>
                              <button 
                                className="flex aspect-square h-9 w-9 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out hover:bg-white/20"
                                onClick={() => handleDeleteNotification(notification._id)}
                              >
                                <IconTrashFilled color={"red"} size={18} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="unread" className="mt-0 flex-1 overflow-y-auto">
                    {!userId ? (
                      <div className="flex h-32 items-center justify-center">
                        <p className="text-muted-foreground">Please sign in to view notifications</p>
                      </div>
                    ) : !unreadNotifications ? (
                      <div className="flex h-32 items-center justify-center">
                        <p className="text-muted-foreground">Loading notifications...</p>
                      </div>
                    ) : !hasUnreadNotifications ? (
                      <div className="flex h-32 items-center justify-center">
                        <p className="text-muted-foreground">No unread notifications</p>
                      </div>
                    ) : (
                      <div className="h-full py-2">
                        {unreadNotifications.page.items.map((notification) => (
                          <div
                            key={notification._id}
                            className="flex items-center justify-between gap-2 p-4 border-b bg-slate-900"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>NP</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col gap-1">
                                <h3 className="font-semibold">{notification.title}</h3>
                                <p className="text-muted-foreground text-sm">
                                  {notification.message}
                                </p>
                                <time className="text-xs text-gray-400">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </time>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="flex aspect-square h-9 w-9 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out hover:bg-white/20"
                                onClick={() => handleMarkAsRead(notification._id)}
                              >
                                <IconCheck size={18} />
                              </button>
                              <button 
                                className="flex aspect-square h-9 w-9 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out hover:bg-white/20"
                                onClick={() => handleDeleteNotification(notification._id)}
                              >
                                <IconTrashFilled color={"red"} size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </nav>
  );
};

export default MainNavbar;