"use client";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "#/components/ui/drawer";
import { Button } from "#/components/ui/button";

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if iOS
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as Window & typeof globalThis & { MSStream?: unknown })
          .MSStream,
    );

    // Check if already installed
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Handle install prompt for non-iOS devices
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the saved prompt regardless of outcome
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 bottom-20 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700"
        >
          <Download className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Install App</DrawerTitle>
          <DrawerDescription>
            Install our app for a better experience
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          {isIOS ? (
            <p className="text-center">
              To install this app on your iOS device, tap the share button
              <span role="img" aria-label="share icon">
                {" "}
                ⎋{" "}
              </span>
              and then &quot;Add to Home Screen&quot;
              <span role="img" aria-label="plus icon">
                {" "}
                ➕{" "}
              </span>
              .
            </p>
          ) : (
            <p className="text-center">
              Install our app to your home screen for quick and easy access.
            </p>
          )}
        </div>
        <DrawerFooter>
          {!isIOS && (
            <Button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className="w-full"
            >
              Add to Home Screen
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default InstallPrompt;
