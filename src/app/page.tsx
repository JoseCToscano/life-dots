"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { HomePage } from "@/app/_components/home";


export default function Home() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 gap-4">
      <SignedIn>
        <HomePage />
      </SignedIn>
      <SignedOut>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to your Life Journey</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignInButton mode="modal">
              <Button size="lg">Sign In</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </SignedOut>
    </main>
  );
}
