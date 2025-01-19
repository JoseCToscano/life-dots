"use client"

import { useState, useEffect, use } from "react"
import { addYears, differenceInWeeks } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LifeDots } from "./life-dots"
import { InstructionsBanner } from "./instructions-banner"
import { UserButton } from "@clerk/nextjs"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

function getWeeksLived(birthDate: Date) {
  const today = new Date();
  const weeksLived = differenceInWeeks(today, birthDate) + 1;
  return weeksLived;
}

function getWeeksRemaining(birthDate: Date) {
  const today = new Date();
  const weeksRemaining = differenceInWeeks(addYears(birthDate, 90), today);
  return weeksRemaining;
}

// Assuming a maximum lifespan of 90 years
const WEEKS_IN_LIFE = 52 * 90

export const HomePage = () => {
  const router = useRouter()
  const { data: user, isLoading, isFetched } = api.user.getUser.useQuery()

  useEffect(() => {
    if (!isLoading && isFetched) {
      if (!user?.birthDate) {
        router.push('/onboarding')
      }
    }
  }, [user, router, isLoading, isFetched])



  if (isLoading) {
    return (
      <div className="min-h-screen">
        <InstructionsBanner />
        <Card className="max-w-4xl mx-auto border-none shadow-none bg-white opacity-80">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-32" />
              <UserButton afterSignOutUrl="/" />
            </div>
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="w-full gap-6 rounded-lg">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const birthDate = new Date(String(user?.birthDate));
  const weeksLived = getWeeksLived(birthDate);
  const weeksRemaining = getWeeksRemaining(birthDate);

  return (
    <div className="min-h-screen flex flex-col">
      <InstructionsBanner />
      <Card className="max-w-4xl mx-auto border-none shadow-none bg-white opacity-80">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Welcome!</CardTitle>
            <UserButton afterSignOutUrl="/" />
          </div>
          <CardDescription>Each dot symbolizes a week of your life, marking the journey you have traveled and the path ahead</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full gap-6 rounded-lg flex flex-col">
            <LifeDots
              weeksLived={weeksLived}
              weeksRemaining={weeksRemaining}
              totalWeeks={WEEKS_IN_LIFE}
              birthDate={birthDate}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto py-8 max-w[350px] mx-auto text-center text-sm text-muted-foreground">
        <p className="mb-2">
          Life in Dots is designed to help you visualize and reflect on your life journey.
          The 90-year lifespan is an estimate and not a prediction.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => router.push('/onboarding')}
        >
          Configure your birthdate
        </Button>
      </div>
    </div>
  )
}

