"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"
import { toast } from "react-hot-toast"
import { useAuth } from "@clerk/nextjs"

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState("")
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const ctx = api.useContext()
  const { mutateAsync: updateBirthdate, isPending: isLoading } = api.user.updateBirthdate.useMutation({
    onSuccess: async () => {
      toast.success("Welcome to Life in Dots!")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  // Calculate max date (must be at least 13 years old)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 13)
  const maxDateString = maxDate.toISOString().split('T')[0]

  // Calculate min date (reasonable maximum age of 120 years)
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 120)
  const minDateString = minDate.toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateBirthdate({ birthdate: dateOfBirth })
      ctx.user.getUser.setData(undefined, { birthDate: new Date(dateOfBirth), id: '' })
      await ctx.user.getUser.invalidate()
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/")
    } catch (e) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If auth is still loading or user is not signed in, don't show the form
  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to Life in Dots</CardTitle>
          <CardDescription>Let's get to know you a little better</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">When were you born?</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                min={minDateString}
                max={maxDateString}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                This helps us visualize your life journey
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

