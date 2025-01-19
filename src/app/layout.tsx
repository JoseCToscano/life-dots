import "@/styles/globals.css";
import Background from "@/components/background";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { env } from "@/env";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Life in Dots",
  description: "Life in Dots is a tool to help you visualize and reflect on your life journey.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ClerkProvider publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <TRPCReactProvider>
            <Background animateDots>
              {children}
            </Background>
            <Toaster position="bottom-right" />
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
