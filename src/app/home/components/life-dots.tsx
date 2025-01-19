"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetDescription, SheetHeader } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format, addWeeks, startOfWeek, endOfWeek, differenceInWeeks, differenceInYears, differenceInDays, isSameMonth, isSameDay, isWithinInterval } from 'date-fns'
import { PencilIcon, SaveIcon, ListTodoIcon } from 'lucide-react'

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
  
  const getLifeStage = (age: number) => {
    if (age < 3) return "Baby"
    if (age < 13) return "Child"
    if (age < 20) return "Teenager"
    if (age < 30) return "Young Adult"
    if (age < 50) return "Adult"
    if (age < 70) return "Middle Age"
    return "Senior"
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-2xl font-bold">
            {ageInYears} years old
          </p>
          <p className="text-sm text-muted-foreground">
            {ageInDays.toLocaleString()} days into your journey
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {getLifeStage(ageInYears)}
        </Badge>
      </CardContent>
    </Card>
  )
}

function JournalComponent({ weekNumber, isLived }: { weekNumber: number, isLived: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [entries, setEntries] = useState<JournalEntries>({})
  const currentEntry = entries[weekNumber] || ''

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to your backend
    console.log('Saving journal entry for week', weekNumber, currentEntry)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Journal Entry</h3>
        {isLived && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? (
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
        )}
      </div>
      
      {isEditing ? (
        <Textarea
          value={currentEntry}
          onChange={(e) => setEntries({ ...entries, [weekNumber]: e.target.value })}
          placeholder="Write about your memories, experiences, or reflections from this week..."
          className="min-h-[100px]"
        />
      ) : (
        <div className="rounded-md bg-muted p-3 text-sm">
          {currentEntry ? (
            <p>{currentEntry}</p>
          ) : (
            <p className="text-muted-foreground">
              {isLived 
                ? "No journal entry for this week yet. Click edit to write about your memories and experiences."
                : "This week hasn't happened yet. Come back later to document your journey."
              }
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ReminderComponent({ weekNumber, isLived }: { weekNumber: number, isLived: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [reminders, setReminders] = useState<WeekReminders>({})
  const currentReminders = reminders[weekNumber] || []

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to your backend
    console.log('Saving reminders for week', weekNumber, currentReminders)
  }

  const toggleReminder = (id: string) => {
    setReminders(prev => ({
      ...prev,
      [weekNumber]: (prev[weekNumber] || []).map(reminder =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    }))
  }

  const addReminder = (text: string) => {
    const newReminder = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false
    }
    setReminders(prev => ({
      ...prev,
      [weekNumber]: [...(prev[weekNumber] || []), newReminder]
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Reminders & Notes</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save
            </>
          ) : (
            <>
              <ListTodoIcon className="h-4 w-4 mr-2" />
              Add
            </>
          )}
        </Button>
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            placeholder={isLived 
              ? "Add a reminder or note about this week..."
              : "Plan ahead - add future reminders or notes..."
            }
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                const text = e.currentTarget.value.trim()
                if (text) {
                  addReminder(text)
                  e.currentTarget.value = ''
                }
              }
            }}
          />
          <p className="text-xs text-muted-foreground">Press Enter to add</p>
        </div>
      ) : (
        <div className="rounded-md bg-muted p-3 space-y-2">
          {currentReminders.length > 0 ? (
            currentReminders.map(reminder => (
              <div 
                key={reminder.id} 
                className="flex items-start gap-2 text-sm"
                onClick={() => toggleReminder(reminder.id)}
              >
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  className="mt-1"
                  onChange={() => {}}
                />
                <span className={cn(
                  reminder.completed && "line-through text-muted-foreground"
                )}>
                  {reminder.text}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No reminders or notes yet. Click add to create some.
            </p>
          )}
        </div>
      )}
    </div>
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
  return (
    <TooltipProvider key={index}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "aspect-square rounded-full cursor-pointer mx-auto my-auto w-1.5 h-1.5",
              props.isBirthdayWeek
                ? "bg-gradient-to-br from-purple-500 to-purple-300"
                : props.isCurrentWeek
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
        <TooltipContent>
          <div className="text-xs">
            <p className="font-semibold">
              {format(props.startDate, 'MMM d')} - {format(props.endDate, 'MMM d, yyyy')}
            </p>
            <p className="text-muted-foreground">
              Year {Math.floor(index / 52) + 1}, Week {index % 52 + 1}
              {props.isBirthdayWeek && " 🎂"}
            </p>
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

  const currentWeekNumber = differenceInWeeks(new Date(), birthDate)

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

  return (
    <>
      <div className="grid auto-rows-fr gap-0.5" style={{ 
        gridTemplateColumns: 'repeat(52, minmax(0, 1fr))',
        width: '100%',
        aspectRatio: '52/90'
      }}>
        {Array.from({ length: totalWeeks }).map((_, index) => {
          const weekStartDate = addWeeks(birthDate, index)
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
            endDate: weekEnd
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
            </div>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <p className="text-sm text-muted-foreground">
              {selectedWeek?.weekNumber && selectedWeek.weekNumber <= weeksLived 
                ? "This week is in your past"
                : "This week is in your future"}
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
                    isLived={selectedWeek.weekNumber <= weeksLived}
                  />
                </TabsContent>
                <TabsContent value="reminders">
                  <ReminderComponent 
                    weekNumber={selectedWeek.weekNumber} 
                    isLived={selectedWeek.weekNumber <= weeksLived}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

