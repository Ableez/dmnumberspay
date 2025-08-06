import "#/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "../trpc/react";
import { ThemeProvider } from "#/components/theme-provider";
import { ConvexClientProvider } from "../lib/convex-client-provider";
import { Toaster } from "#/components/ui/sonner";

export const metadata: Metadata = {
  title: "NumbersPay",
  description:
    "NumbersPay is the easiest way to move money globally—just use a phone number as your account. Send, receive, and hold crypto or fiat, regardless of currency or region. Recipients get funds in crypto and choose when and how to convert to their local currency.",
  icons: [{ rel: "icon", url: "/icons/512.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => (
  <html lang="en" className={geist.variable} suppressHydrationWarning>
    <body>
      <TRPCReactProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <ConvexClientProvider>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>
      </TRPCReactProvider>
    </body>
  </html>
);

export default RootLayout;
