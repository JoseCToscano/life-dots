"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LifeDots } from "./components/life-dots"

// Assuming a maximum lifespan of 90 years
const WEEKS_IN_LIFE = 52 * 90

export default function HomePage() {
  const [age, setAge] = useState(25) // Default age, replace with actual user data
  const [lifeExpectancy, setLifeExpectancy] = useState(80) // Default life expectancy

  const weeksLived = age * 52
  const weeksRemaining = (lifeExpectancy - age) * 52

  useEffect(() => {
    // Here you would typically fetch the user's actual age from your backend
    // setAge(fetchedAge)
  }, [])

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-4xl mx-auto border-none shadow-none bg-white opacity-80">
        <CardHeader>
          <CardTitle>Your Life in Dots</CardTitle>
          <CardDescription>Each dot represents a week of your life. Hover over the dots to see the enhanced wave effect across rows and columns, and click on a dot for more information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full gap-6 px-20 rounded-lg flex flex-col">

            <LifeDots weeksLived={weeksLived} weeksRemaining={weeksRemaining} totalWeeks={WEEKS_IN_LIFE} />
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

