"use client"

import React, { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetDescription, SheetHeader } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { cn, pluralize } from '@/lib/utils'
import { format, addWeeks, startOfWeek, endOfWeek, differenceInWeeks, differenceInYears, differenceInDays, isSameMonth, isSameDay, isWithinInterval } from 'date-fns'
import { PencilIcon, SaveIcon, ListTodoIcon, LightbulbIcon, XIcon } from 'lucide-react'
import { recomendations } from '@/lib/recomendations'
import { api } from '@/trpc/react'
import { toast } from 'react-hot-toast'
import { Week } from '@prisma/client'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'


interface LifeDotsProps {
  weeksLived: number
  weeksRemaining: number
  totalWeeks: number
  birthDate: Date
}

interface WeekDetails {
  weekNumber: number
  year: number
  weekInYear: number
  startDate: Date
  endDate: Date
}

interface JournalEntries {
  [key: number]: string
}

interface Reminder {
  id: string
  text: string
  completed: boolean
}

interface WeekReminders {
  [key: number]: Reminder[]
}


function ProfileSummary({ date, birthDate }: { date: Date, birthDate: Date }) {
  const ageInYears = differenceInYears(date, birthDate)
  const ageInDays = differenceInDays(date, birthDate)

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-2xl font-bold">
            {ageInYears > 0 ? `${ageInYears} ${pluralize(ageInYears, "year")} old` : "Your first year"}
          </p>
          <p className="text-sm text-muted-foreground">
            {ageInDays.toLocaleString()} days into your journey
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function JournalComponent({ weekData, weekNumber }: { weekData: Week | null | undefined, weekNumber: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentEntry, setCurrentEntry] = useState(weekData?.journalText || '')

  useEffect(() => {
    if (weekData) {
      setCurrentEntry(weekData.journalText || '')
    }
  }, [weekData])

  // tRRPC procedures
  const ctx = api.useContext()
  const { mutate: upsertJournalEntry } = api.weeks.upsertJournalEntry.useMutation({
    onError(error, variables, context) {
      toast.error('Failed to save journal entry')
      // Revert optimistic update on error
      if ((context as any)?.previousData) {
        ctx.weeks.getWeek.setData({ weekNumber }, (context as any).previousData)
      }
    },
    onSuccess(data, variables, context) {
      toast.success('Journal entry saved')
    },
    onMutate: async ({ weekNumber, journalText }) => {
      // Cancel outgoing fetches
      await ctx.weeks.getWeek.cancel({ weekNumber })

      // Get current data
      const previousData = ctx.weeks.getWeek.getData({ weekNumber })

      // Optimistically update the UI
      ctx.weeks.getWeek.setData({ weekNumber }, (old) => ({
        ...old,
        id: old?.id ?? 0,
        weekNumber,
        journalText,
        reminders: old?.reminders ?? null,
        userId: old?.userId ?? '',
        createdAt: old?.createdAt ?? new Date(),
        updatedAt: old?.updatedAt ?? new Date(),
      }))

      return { previousData }
    },
    onSettled() {
      // Refetch in the background to ensure data consistency
      ctx.weeks.getWeek.invalidate()
      ctx.weeks.getAllWeeks.invalidate()
    }
  });

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await upsertJournalEntry({
        weekNumber,
        journalText: currentEntry,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save journal entry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Journal Entry</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            "Loading..."
          ) : isEditing ? (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save
            </>
          ) : (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <Textarea
          value={currentEntry}
          onChange={(e) => setCurrentEntry(e.target.value)}
          placeholder="Write about your plans, goals, or aspirations for this week..."
          className="min-h-[100px]"
        />
      ) : (
        <div className="rounded-md bg-muted p-3 text-sm">
          {currentEntry ? (
            <p>{currentEntry}</p>
          ) : (
            <p className="text-muted-foreground">
              No journal entry yet. Click edit to write about your plans or experiences.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ReminderComponent({ weekData, weekNumber }: { weekData: Week | null | undefined, weekNumber: number }) {
  const ctx = api.useContext();
  const [isEditing, setIsEditing] = useState(false);
  const [currentReminders, setCurrentReminders] = useState(weekData?.reminders ?? '');

  // Update local state when weekData changes
  useEffect(() => {
    setCurrentReminders(weekData?.reminders ?? '');
  }, [weekData?.reminders]);

  const { mutate: updateReminders, isPending: isLoading } = api.weeks.updateReminders.useMutation({
    onError(error, variables, context) {
      toast.error('Failed to save reminders')
      if ((context as any)?.previousData) {
        ctx.weeks.getWeek.setData({ weekNumber }, (context as any).previousData)
      }
    },
    onSuccess() {
      toast.success('Reminders saved')
      setIsEditing(false)
    },
    onMutate: async ({ weekNumber, reminders }) => {
      await ctx.weeks.getWeek.cancel({ weekNumber })
      const previousData = ctx.weeks.getWeek.getData({ weekNumber })
      ctx.weeks.getWeek.setData({ weekNumber }, (old) => ({
        ...old,
        reminders,
        id: old?.id ?? 0,
        weekNumber,
        journalText: old?.journalText ?? null,
        userId: old?.userId ?? '',
        createdAt: old?.createdAt ?? new Date(),
        updatedAt: old?.updatedAt ?? new Date(),
      }))
      return { previousData }
    },
    onSettled() {
      ctx.weeks.getWeek.invalidate()
    }
  });

  const handleSave = () => {
    updateReminders({
      weekNumber,
      reminders: currentReminders,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Reminders</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            "Loading..."
          ) : isEditing ? (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save
            </>
          ) : (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <Textarea
          value={currentReminders}
          onChange={(e) => setCurrentReminders(e.target.value)}
          placeholder="Add your reminders, goals, or plans for this week..."
          className="min-h-[100px]"
        />
      ) : (
        <div className="rounded-md bg-muted p-3 text-sm">
          {currentReminders ? (
            <p>{currentReminders}</p>
          ) : (
            <p className="text-muted-foreground">
              No reminders set yet. Click edit to add reminders or plans.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function InsightCard({ weekNumber }: { weekNumber: number }) {
  const insight = recomendations[weekNumber] || null

  if (!insight) return null

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4">
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <LightbulbIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Life Insight</p>
            <p className="text-sm text-muted-foreground italic">
              "{insight}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function buildDotWithTooltip(index: number, props: {
  isLived: boolean
  isCurrentWeek: boolean
  isBirthdayWeek: boolean
  scale: number
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
  startDate: Date
  endDate: Date
}) {
  const weekInsight = recomendations[String(index)] || null

  console.log('weekInsight', weekInsight)
  console.log('startDate', props.startDate)
  console.log('endDate', props.endDate)

  return (
    <TooltipProvider key={index}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "aspect-square rounded-full cursor-pointer mx-auto my-auto w-1 h-1 sm:w-1.5 sm:h-1.5",
              props.isCurrentWeek
                ? "bg-gradient-to-br from-blue-500 to-blue-300"
                : props.isLived
                  ? "bg-gradient-to-br from-black to-gray-300"
                  : "bg-gradient-to-br from-gray-100 to-gray-300"
            )}
            animate={{
              scale: props.scale,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
            onClick={props.onClick}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium">
                {format(props.startDate, 'MMM d')} - {format(props.endDate, 'MMM d, yyyy')}
              </p>
              {props.isBirthdayWeek && (
                <Badge variant="secondary" className="h-5">
                  Birthday 🎂
                </Badge>
              )}
            </div>
            {weekInsight && (
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground italic">
                  "{weekInsight}"
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const LifeDots: React.FC<LifeDotsProps> = ({ weeksLived, weeksRemaining, totalWeeks, birthDate }) => {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<WeekDetails | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    console.log('weeksLived', weeksLived)
    console.log('weeksRemaining', weeksRemaining)
    console.log('totalWeeks', totalWeeks)
    console.log('birthDate', birthDate)
    if (!birthDate) {
      router.push('/onboarding')
    }
  }, [weeksLived, weeksRemaining, totalWeeks, birthDate])

  // Only query when sheet is open and we have a selected week
  const { data: weekData, isFetching, isLoading: isWeekDataLoading } = api.weeks.getWeek.useQuery(
    { weekNumber: selectedWeek?.weekNumber ?? 0 },
    { enabled: isSheetOpen && selectedWeek !== null }
  )

  const currentWeekNumber = differenceInWeeks(new Date(), birthDate) + 1

  const isBirthdayInWeek = (startDate: Date, endDate: Date) => {
    const birthdayThisYear = new Date(
      startDate.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    )
    return isWithinInterval(birthdayThisYear, { start: startDate, end: endDate })
  }

  const handleDotClick = (index: number) => {
    const weekStartDate = addWeeks(birthDate, index)
    const weekDetails = {
      weekNumber: index + 1,
      year: Math.floor(index / 52) + 1,
      weekInYear: (index % 52) + 1,
      startDate: startOfWeek(weekStartDate),
      endDate: endOfWeek(weekStartDate)
    }
    setSelectedWeek(weekDetails)
    setIsSheetOpen(true)
  }

  const getScaleValue = (index: number) => {
    if (hoveredDot === null) return 1

    const weekDiff = index % 52 - hoveredDot % 52
    const yearDiff = Math.floor(index / 52) - Math.floor(hoveredDot / 52)
    const distance = Math.sqrt(weekDiff * weekDiff + yearDiff * yearDiff)

    return 1 + Math.exp(-distance / 5) * 0.5
  }

  if (!birthDate) {
    return null
  }

  return (
    <div>
      <div className="grid auto-rows-fr gap-0.5 sm:gap-0.5" style={{
        gridTemplateColumns: 'repeat(52, minmax(0, 1fr))',
        width: '100%',
        aspectRatio: '52/90'
      }}>
        {Array.from({ length: totalWeeks }).map((_, index) => {
          console.log('birthDate', birthDate, typeof birthDate, JSON.stringify(birthDate))
          const weekStartDate = addWeeks(birthDate, index)
          console.log('weekStartDate', weekStartDate)
          const weekStart = startOfWeek(weekStartDate)
          const weekEnd = endOfWeek(weekStartDate)
          return buildDotWithTooltip(index, {
            isLived: index < weeksLived,
            isCurrentWeek: index === currentWeekNumber,
            isBirthdayWeek: isBirthdayInWeek(weekStart, weekEnd),
            scale: getScaleValue(index),
            onMouseEnter: () => setHoveredDot(index),
            onMouseLeave: () => setHoveredDot(null),
            onClick: () => handleDotClick(index),
            startDate: weekStart,
            endDate: weekEnd,
          })
        })}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                {selectedWeek && format(selectedWeek.startDate, 'MMM d')} - {selectedWeek && format(selectedWeek.endDate, 'MMM d, yyyy')}
                {selectedWeek && isBirthdayInWeek(selectedWeek.startDate, selectedWeek.endDate) && " 🎂"}
              </Badge>
              {selectedWeek && (
                <ProfileSummary
                  date={selectedWeek.startDate}
                  birthDate={birthDate}
                />
              )}
              {selectedWeek && (
                <InsightCard weekNumber={selectedWeek.weekNumber - 1} />
              )}
            </div>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <p className="text-sm text-muted-foreground">
              {selectedWeek?.weekNumber && selectedWeek.weekNumber <= weeksLived
                ? "Let's take a look at your past week"
                : "This week hasn't happened yet, let's plan ahead"}
            </p>
            {selectedWeek && (
              <Tabs defaultValue="journal" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="journal">Journal</TabsTrigger>
                  <TabsTrigger value="reminders">Reminders</TabsTrigger>
                </TabsList>
                <TabsContent value="journal">
                  <JournalComponent
                    weekNumber={selectedWeek.weekNumber}
                    weekData={weekData}
                  />
                </TabsContent>
                <TabsContent value="reminders">
                  <ReminderComponent
                    weekNumber={selectedWeek.weekNumber}
                    weekData={weekData}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

