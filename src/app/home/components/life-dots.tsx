"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from 'lucide-react'

interface LifeDotsProps {
  weeksLived: number
  weeksRemaining: number
  totalWeeks: number
}

function DayWithShiftKey(
  props: {},
  data: Element[],
) {
  // const ctx = api.useContext();
  // const deleteEvent = api.calendar.deleteEvent.useMutation({
  //   onSuccess: () => {
  //     ctx.calendar.getEvents.invalidate();
  //   },
  //   onError: (error) => {
  //     toast.error("Error al eliminar el evento");
  //   },
  // });
  const [open, setOpen] = React.useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <HoverCard
      openDelay={100}
      closeDelay={100}
      open={open}
      onOpenChange={setOpen}
    >
      <HoverCardTrigger onClick={() => setOpen(true)} asChild>
        <Button
          className={cn(
            "w-2 h-2 rounded-full cursor-pointer mx-auto my-auto",
            "bg-gradient-to-br from-black to-gray-300"
          )}
          ref={buttonRef}
        
        >
          <motion.div
          key={index}
          className={`aspect-square rounded-full cursor-pointer mx-auto my-auto w-2 h-2 ${
            index < weeksLived
              ? "bg-gradient-to-br from-black to-gray-300"
              : index < weeksLived + weeksRemaining
              ? "bg-gradient-to-br from-gray-100 to-gray-300"
              : "bg-transparent"
          }`}
          animate={{
            scale: getScaleValue(index),
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredDot(index)}
          onMouseLeave={() => setHoveredDot(null)}
          onClick={() => handleDotClick(index)}
        />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-64 bg-white">
        <div>
          <div className="flex flex-col justify-between">
            <div className="flex justify-between">
              <p className="text-sm font-semibold">
                Hello
              </p>
              <Badge size="xs">
                Hello
              </Badge>
            </div>
            <p className="text-xs font-light">
              {"JJJ"}
            </p>
            <p className="text-xs font-light">$aa</p>
          </div>
        </div>
        <hr className="my-2" />
        <div className="grid grid-cols-2">
          <p className="text-left text-xs">
            <span className=" text-green-600">!</span>{" "}
            <span className="font-light text-muted-foreground">
              operaciones
            </span>
          </p>
          <p className="flex flex-col text-right text-xs">
            <span className="text-sm text-neutral-600">
              $100
            </span>{" "}
            <span className="text-xs font-light text-neutral-400">
              Balance a la fecha
            </span>
          </p>
        </div>

      
      </HoverCardContent>
    </HoverCard>
  );
}

export const LifeDots: React.FC<LifeDotsProps> = ({ weeksLived, weeksRemaining, totalWeeks }) => {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null)

  const handleDotClick = (index: number) => {
    // You can implement custom click behavior here
    console.log(`Clicked dot ${index}`)
  }

  const getScaleValue = (index: number) => {
    if (hoveredDot === null) return 1

    const weekDiff = index % 52 - hoveredDot % 52
    const yearDiff = Math.floor(index / 52) - Math.floor(hoveredDot / 52)
    const distance = Math.sqrt(weekDiff * weekDiff + yearDiff * yearDiff)

    return 1 + Math.exp(-distance / 5) * 0.5
  }

  return (
    <div className="grid auto-rows-fr gap-0.5" style={{ 
      gridTemplateColumns: 'repeat(52, minmax(0, 1fr))',
      width: '100%',
      aspectRatio: '52/90'
    }}>
      {Array.from({ length: totalWeeks }).map((_, index) => (
        <motion.div
          key={index}
          className={`aspect-square rounded-full cursor-pointer mx-auto my-auto w-2 h-2 ${
            index < weeksLived
              ? "bg-gradient-to-br from-black to-gray-300"
              : index < weeksLived + weeksRemaining
              ? "bg-gradient-to-br from-gray-100 to-gray-300"
              : "bg-transparent"
          }`}
          animate={{
            scale: getScaleValue(index),
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHoveredDot(index)}
          onMouseLeave={() => setHoveredDot(null)}
          onClick={() => handleDotClick(index)}
        />
      ))}
    </div>
  )
}

